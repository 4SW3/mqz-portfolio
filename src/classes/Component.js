import autoBind from 'auto-bind'
import EventEmitter from 'events'

export default class Component extends EventEmitter {
  // constructor({ classes, element, elements, elementsForceArray }) {
  constructor({ classes, element, elements }) {
    super()
    autoBind(this)

    this.classes = classes
    this.selectors = {
      element,
      elements: { ...elements }
    }

    this.create()
    this.addEventListeners()
  }

  create() {
    this.element = this.selectors.element instanceof window.HTMLElement ?
      this.selectors.element : document.querySelector(this.selectors.element)

    this.elements = {}

    for (const key in this.selectors.elements) {
      const val = this.selectors.elements[key]

      if (val instanceof window.HTMLElement ||
        val instanceof window.NodeList ||
        Array.isArray(val)
      )
        this.elements[key] = val

      else {
        this.elements[key] = document.querySelectorAll(val)

        if (!this.elements[key].length)
          this.elements[key] = null
        else if (this.elements[key].length === 1)
          this.elements[key] = this.element.querySelector(val)
      }
    }
  }

  addEventListeners() { }

  removeEventListeners() { }

  destroy() {
    this.removeEventListeners()
  }
}