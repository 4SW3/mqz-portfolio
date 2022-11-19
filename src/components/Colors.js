import gsap from 'gsap'

class Colors {
  change({ bgColor, color, fill, customDuration, customDelay }) {
    const isHome = window.location.pathname === '/'

    gsap.to([
      document.documentElement,
      document.querySelector('.nav_link_icon')
    ], {
      background: bgColor,
      color,
      fill,
      duration: customDuration ? customDuration : isHome ? 1 : 1.5,
      delay: customDelay ? customDelay : isHome ? 0 : 0.5,
    })
  }
}

export default new Colors()