import Component from "../classes/Component"
import ColorsManager from '../components/Colors'
import { colors } from "../utils/constants"

export default class Nav extends Component {
  constructor({ url }) {
    super({
      classes: {},
      element: '.nav',
      elements: {
        list: '.nav_list',
        navIcon: '.nav_link_icon',
        navLinkIcon: '.nav_link_icon',
      }
    })

    this.onChange(url)
  }

  onChange(url) {
    const curUrl = url === '/' ? 'home' : url.split('/')[2]

    ColorsManager.change({
      color: colors[curUrl].cl,
      fill: colors[curUrl].cl,
      customDelay: 1,
    })
  }
}