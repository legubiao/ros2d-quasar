export default function (type) {
  switch (type) {
    case 'basic': return basicLinks
  }
}

const basicLinks = [
  {
    title: 'router_amr_2d',
    caption: 'router_amr_2d_description',
    icon: 'wifi_tethering',
    link: 'amr'
  },
  {
    title: 'router_joystick',
    caption: 'router_joystick_description',
    icon: 'sports_esports',
    link: 'joystick'
  },
  {
    title: 'router_service',
    caption: 'router_service_description',
    icon: 'settings_phone',
    link: 'service'
  },
  {
    title: 'router_service',
    caption: 'router_service_description',
    icon: 'tune',
    link: 'param'
  }
]
