import Component from "./Component"

export default class Animation extends Component {
  constructor({ element, elements }) {
    super({ element, elements })
    this.element = element

    this.createObserver()
    this.animateOut()
  }

  createObserver() {
    this.observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting))
        this.animateIn()
      else this.animateOut()
    })
    // }, {
    //   threshold: 1.0
    // })

    this.observer.observe(this.element)
  }

  animateIn() { }

  animateOut() { }
}