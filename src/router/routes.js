const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'main', component: () => import('pages/IndexPage.vue') },
      { path: 'amr', name: 'amr_2d', component: () => import('pages/AmrControl.vue') },
      { path: 'service', name: 'service', component: () => import('pages/RosService.vue') },
      { path: 'joystick', name: 'joystick', component: () => import('pages/JoystickPage.vue') },
      { path: 'setting', name: 'setting', component: () => import('pages/SettingPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
