import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const loginAnimations = [
  trigger('fadeInUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(30px)' }),
      animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),

  trigger('slideDown', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-10px)', maxHeight: 0 }),
      animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)', maxHeight: '100px' }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)', maxHeight: 0 }))
    ])
  ]),

  trigger('shake', [
    transition('* => *', [
      animate('500ms ease-in-out', keyframes([
        style({ transform: 'translateX(0)', offset: 0 }),
        style({ transform: 'translateX(-10px)', offset: 0.1 }),
        style({ transform: 'translateX(10px)', offset: 0.2 }),
        style({ transform: 'translateX(-10px)', offset: 0.3 }),
        style({ transform: 'translateX(10px)', offset: 0.4 }),
        style({ transform: 'translateX(-5px)', offset: 0.5 }),
        style({ transform: 'translateX(5px)', offset: 0.6 }),
        style({ transform: 'translateX(0)', offset: 1 })
      ]))
    ])
  ]),

  trigger('pulse', [
    transition('* => *', [
      animate('200ms ease-in-out', keyframes([
        style({ transform: 'scale(1)', offset: 0 }),
        style({ transform: 'scale(1.05)', offset: 0.5 }),
        style({ transform: 'scale(1)', offset: 1 })
      ]))
    ])
  ]),

  trigger('bounceIn', [
    transition(':enter', [
      animate('600ms ease-out', keyframes([
        style({ opacity: 0, transform: 'scale(0.3)', offset: 0 }),
        style({ opacity: 1, transform: 'scale(1.05)', offset: 0.8 }),
        style({ opacity: 1, transform: 'scale(1)', offset: 1 })
      ]))
    ])
  ])
];
