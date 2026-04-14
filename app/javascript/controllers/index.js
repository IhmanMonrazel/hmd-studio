import { application } from "./application"

import NavbarController from "./navbar_controller"
application.register("navbar", NavbarController)

import NavbarScrollController from "./navbar_scroll_controller"
application.register("navbar-scroll", NavbarScrollController)

import ScrollRevealController from "./scroll_reveal_controller"
application.register("scroll-reveal", ScrollRevealController)

import HeroController from "./hero_controller"
application.register("hero", HeroController)

import GsapShowcaseController from "./gsap_showcase_controller"
application.register("gsap-showcase", GsapShowcaseController)

import SafemoovShowcaseController from "./safemoov_showcase_controller"
application.register("safemoov-showcase", SafemoovShowcaseController)


import TicketRevealController from "./ticket_reveal_controller"
application.register("ticket-reveal", TicketRevealController)

import AboutScanController from "./about_scan_controller"
application.register("about-scan", AboutScanController)

import HomeScrollController from "./home_scroll_controller"
application.register("home-scroll", HomeScrollController)

import ApproachRevealController from "./approach_reveal_controller"
application.register("approach-reveal", ApproachRevealController)

import CtaRevealController from "./cta_reveal_controller"
application.register("cta-reveal", CtaRevealController)

import Tribal3dController from "./tribal3d_controller"
application.register("tribal3d", Tribal3dController)

import CursorController from "./cursor_controller"
application.register("cursor", CursorController)

import PageTransitionController from "./page_transition_controller"
application.register("page-transition", PageTransitionController)

import ScrambleController from "./scramble_controller"
application.register("scramble", ScrambleController)

import GrainController from "./grain_controller"
application.register("grain", GrainController)

import MagneticController from "./magnetic_controller"
application.register("magnetic", MagneticController)

import Portrait3dController from "./portrait3d_controller"
application.register("portrait3d", Portrait3dController)

import ServicesScrollController from "./services_scroll_controller"
application.register("services-scroll", ServicesScrollController)
