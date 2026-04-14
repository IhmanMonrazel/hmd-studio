import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.targetProx = 0
    this.currentProx = 0
    this.rafId = null
    this.startTime = performance.now()

    this.canvas = document.createElement('canvas')
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.display = 'block'
    this.element.appendChild(this.canvas)

    this.gl = this.canvas.getContext('webgl', { antialias: true, alpha: false })
    if (!this.gl) return

    this.initWebGL()
    this.initQuad()

    this.resizeObserver = new ResizeObserver(() => this.handleResize())
    this.resizeObserver.observe(this.element)
    this.handleResize()

    this.onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const dx = mx - rect.width / 2
      const dy = my - rect.height / 2
      this.targetProx = Math.max(0, 1 - Math.sqrt(dx*dx + dy*dy) / 220)
    }
    this.onMouseLeave = () => { this.targetProx = 0 }
    this.element.addEventListener('mousemove', this.onMouseMove)
    this.element.addEventListener('mouseleave', this.onMouseLeave)

    this.render()
  }

  disconnect() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    if (this.resizeObserver) this.resizeObserver.disconnect()
    this.element.removeEventListener('mousemove', this.onMouseMove)
    this.element.removeEventListener('mouseleave', this.onMouseLeave)
    if (this.gl) {
      const ext = this.gl.getExtension('WEBGL_lose_context')
      if (ext) ext.loseContext()
    }
  }

  handleResize() {
    const w = this.element.offsetWidth
    const h = this.element.offsetHeight
    this.canvas.width = w
    this.canvas.height = h
    if (this.gl) this.gl.viewport(0, 0, w, h)
  }

  initWebGL() {
    const gl = this.gl

    const vs = `
      attribute vec2 aPos;
      void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
    `

    const fs = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uRes;
      uniform float uProx;

      float hash(float n) { return fract(sin(n)*43758.5453); }

      float noise(vec3 p) {
        vec3 i = floor(p); vec3 f = fract(p);
        f = f*f*(3.0-2.0*f);
        float n = i.x + i.y*57.0 + i.z*113.0;
        return mix(
          mix(mix(hash(n),hash(n+1.0),f.x),mix(hash(n+57.0),hash(n+58.0),f.x),f.y),
          mix(mix(hash(n+113.0),hash(n+114.0),f.x),mix(hash(n+170.0),hash(n+171.0),f.x),f.y),
          f.z);
      }

      float fbm(vec3 p, int oct) {
        float v=0.0, a=0.5;
        for(int i=0;i<6;i++){
          if(i>=oct) break;
          v+=a*noise(p); p=p*2.1+vec3(1.7,9.2,8.3); a*=0.5;
        }
        return v;
      }

      float sdfEntity(vec3 p, float t) {
        float r = length(p);
        float baseR = 1.35 + 0.06*sin(t*0.7) + 0.04*sin(t*1.3+1.2);
        float d1 = fbm(p*0.9 + vec3(t*0.08,t*0.05,t*0.06), 4);
        float d2 = fbm(p*1.8 - vec3(t*0.06,t*0.09,t*0.04), 3);
        float d3 = fbm(p*3.2 + vec3(t*0.12,t*0.07,t*0.11), 2);
        float distort = d1*0.45 + d2*0.18 + d3*0.07;
        float pulse = 0.05*sin(t*1.8)*exp(-r*1.2);
        return r - (baseR + distort + pulse);
      }

      float filament(vec3 p, float t) {
        float f = 0.0;
        for(int i=0;i<8;i++){
          float fi = float(i);
          float angle = fi*0.7854 + t*0.04 + sin(t*0.3+fi)*0.15;
          float tilt  = fi*0.3927 + sin(t*0.25+fi*0.7)*0.2;
          vec3 dir = vec3(cos(tilt)*cos(angle), sin(tilt), cos(tilt)*sin(angle));
          float s = clamp(dot(p,dir), 0.0, 1.5);
          vec3 closest = dir*s;
          float wx = 0.08*sin(s*4.0+t*0.8+fi)+0.04*sin(s*8.0+t*1.2+fi*0.5);
          float wy = 0.08*cos(s*3.5+t*0.9+fi*0.8)+0.04*cos(s*7.0+t*1.1+fi*0.3);
          closest += vec3(wx, wy, wx*0.5);
          float dist = length(p - closest);
          float width = 0.025+0.015*sin(t*1.5+fi)+0.01*sin(s*6.0+t);
          f += (0.7+0.3*sin(t*0.6+fi*1.3)) * exp(-dist*dist/(width*width*2.0));
        }
        for(int i=0;i<14;i++){
          float fi=float(i);
          float a2=fi*0.449+t*0.06+sin(t*0.4+fi*0.9)*0.3;
          float t2=fi*0.897+cos(t*0.2+fi)*0.25;
          vec3 dir2=vec3(cos(t2)*cos(a2),sin(t2)*cos(a2),sin(a2));
          float s2=clamp(dot(p,dir2),0.0,1.2);
          vec3 cl2=dir2*s2;
          cl2+=vec3(0.06*sin(s2*9.0+t*2.0+fi),0.06*cos(s2*7.0+t*1.8+fi*0.7),0.0);
          float d2=length(p-cl2);
          float w2=0.012+0.008*sin(t*2.1+fi*0.8);
          f+=0.35*exp(-d2*d2/(w2*w2*2.0));
        }
        return f;
      }

      float membrane(vec3 p, float t) {
        float m=0.0;
        for(int i=0;i<4;i++){
          float fi=float(i);
          float r=0.6+fi*0.28+0.05*sin(t*0.5+fi);
          float n1=fbm(p*1.2+vec3(t*0.07+fi,t*0.05,fi),3);
          float n2=fbm(p*2.5-vec3(fi,t*0.08,t*0.06+fi),2);
          float shell=abs(length(p)-r-n1*0.3-n2*0.12);
          float torn=0.5+0.5*sin(fbm(p*4.0+vec3(t*0.1+fi),2)*6.0);
          m+=(0.018/(shell+0.01))*torn*(0.4+fi*0.15);
        }
        return m;
      }

      float sparks(vec3 p, float t) {
        float sp=0.0;
        for(int i=0;i<6;i++){
          float fi=float(i);
          float phase=hash(fi+1.0);
          float active=step(0.7,sin(t*3.0+fi*2.1+phase*6.28));
          float a=fi*1.047+t*0.15+phase;
          float tl=fi*0.524+sin(t*0.4+fi)*0.3;
          vec3 dir=vec3(cos(tl)*cos(a),sin(tl),cos(tl)*sin(a));
          float s=clamp(dot(p,dir),0.2,1.3);
          vec3 cl=dir*s;
          cl+=vec3(hash(fi+s*10.0+floor(t*8.0))-0.5,
                   hash(fi+s*13.0+floor(t*8.0)+5.0)-0.5,0.0)*0.12*s;
          float d=length(p-cl);
          sp+=active*0.6*exp(-d*d*180.0);
        }
        return sp;
      }

      void main() {
        vec2 uv=(gl_FragCoord.xy - uRes*0.5)/min(uRes.x,uRes.y);
        float t=uTime;
        float camDrift=0.06*sin(t*0.23)+0.04*sin(t*0.37+1.2);
        float camTilt=0.04*cos(t*0.19)+0.03*cos(t*0.31+0.8);
        float lev=0.12*sin(t*0.55)+0.06*sin(t*0.83+0.5);
        vec3 ro=vec3(sin(camDrift)*3.8, lev+sin(camTilt)*0.3, cos(camDrift)*3.8);
        vec3 target=vec3(0.0,lev*0.3,0.0);
        vec3 fw=normalize(target-ro);
        vec3 ri=normalize(cross(fw,vec3(0,1,0)));
        vec3 up2=cross(ri,fw);
        vec3 rd=normalize(fw+uv.x*ri+uv.y*up2);

        float density=0.0, filDensity=0.0, memDensity=0.0;
        float sparkDensity=0.0, depthGlow=0.0;
        float distTotal=0.0, dt=0.045;

        for(int i=0;i<55;i++){
          vec3 p=ro+rd*distTotal;
          float r=length(p);
          if(r>3.5) break;
          float sdf=sdfEntity(p,t);
          float fil=filament(p,t);
          float mem=membrane(p,t);
          float sp=sparks(p,t);
          float surfaceDens=exp(-max(sdf,0.0)*4.5)*step(sdf,0.15);
          float intDens=exp(-r*1.1)*step(-sdf,0.0);
          density+=(surfaceDens*0.8+intDens*0.3)*dt;
          filDensity+=fil*exp(-max(r-0.1,0.0)*0.8)*dt*0.7;
          memDensity+=mem*dt*0.6;
          sparkDensity+=sp*dt;
          depthGlow+=exp(-r*r*0.5)*(1.0+0.3*sin(t*1.5+r*4.0))*dt*0.5;
          dt=0.038+sdf*0.12;
          distTotal+=max(dt,0.02);
        }

        float volGlow=0.0;
        float vdt=0.04; float vd=0.0;
        for(int i=0;i<32;i++){
          vec3 p=ro+rd*vd;
          float r=length(p);
          float ig=exp(-r*r*0.8)*(0.8+0.2*sin(t*1.2+r*3.0));
          float rg=exp(-abs(r-0.4-0.15*sin(t*1.8))*8.0)*0.4;
          float rg2=exp(-abs(r-0.85-0.1*sin(t*1.4+1.0))*6.0)*0.25;
          volGlow+=(ig+rg+rg2)*vdt;
          vd+=vdt;
        }
        volGlow*=0.4;

        float coreI=depthGlow*(2.5+uProx*1.2);
        vec3 coreCol=mix(vec3(1.0,0.35,0.15),vec3(1.0,0.92,0.85),clamp(coreI*0.8,0.0,1.0));
        float surfI=clamp(density,0.0,1.0);
        vec3 surfCol=mix(vec3(0.5,0.0,0.0),vec3(0.9,0.1,0.05),surfI);
        float filI=clamp(filDensity,0.0,1.5);
        vec3 filCol=mix(vec3(0.8,0.05,0.0),vec3(1.0,0.55,0.1),filI*0.6);
        float memI=clamp(memDensity*0.6,0.0,0.8);
        vec3 memCol=vec3(0.45,0.0,0.0);
        float spI=clamp(sparkDensity*2.0,0.0,1.0);
        vec3 spkCol=mix(vec3(1.0,0.3,0.1),vec3(1.0,0.85,0.7),spI);
        vec3 volCol=vec3(0.6,0.0,0.0)*volGlow*(1.0+uProx*0.5);

        vec3 col=vec3(0.0);
        col+=surfCol*surfI*0.7;
        col+=filCol*filI*0.9;
        col+=memCol*memI*0.5;
        col+=spkCol*spI;
        col+=coreCol*coreI*0.9;
        col+=volCol;
        col*=(1.0+uProx*0.4);

        float bgGlow=exp(-length(uv)*1.8)*0.08*(1.0+uProx*0.3);
        col+=vec3(0.3,0.0,0.0)*bgGlow;
        col=col/(col+0.85);
        col=pow(col,vec3(0.88));
        float vig=clamp(1.0-length(uv*0.75),0.0,1.0);
        col*=vig;

        gl_FragColor=vec4(col,1.0);
      }
    `

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s))
        return null
      }
      return s
    }

    const vShader = compile(gl.VERTEX_SHADER, vs)
    const fShader = compile(gl.FRAGMENT_SHADER, fs)
    this.program = gl.createProgram()
    gl.attachShader(this.program, vShader)
    gl.attachShader(this.program, fShader)
    gl.linkProgram(this.program)

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(this.program))
    }

    this.uTime  = gl.getUniformLocation(this.program, 'uTime')
    this.uRes   = gl.getUniformLocation(this.program, 'uRes')
    this.uProx  = gl.getUniformLocation(this.program, 'uProx')
    this.aPos   = gl.getAttribLocation(this.program, 'aPos')
  }

  initQuad() {
    const gl = this.gl
    this.quadBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf)
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, 1,1]),
      gl.STATIC_DRAW)
  }

  render() {
    const gl = this.gl
    if (!gl || !this.program) return

    const t = (performance.now() - this.startTime) / 1000
    this.currentProx += (this.targetProx - this.currentProx) * 0.04

    gl.useProgram(this.program)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf)
    gl.enableVertexAttribArray(this.aPos)
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0)

    gl.uniform1f(this.uTime, t)
    gl.uniform2f(this.uRes, this.canvas.width, this.canvas.height)
    gl.uniform1f(this.uProx, this.currentProx)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    this.rafId = requestAnimationFrame(() => this.render())
  }
}
