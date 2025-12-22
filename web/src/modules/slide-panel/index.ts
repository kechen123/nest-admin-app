import SlideContainer from './SlideContainer.vue'
import AsideContainer from './AsideContainer.vue'

export default {
  install(app: any) {
    app.component('SlideContainer', SlideContainer)
    app.component('AsideContainer', AsideContainer)
  },
}

export { SlideContainer, AsideContainer }
