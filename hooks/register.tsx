import type { Register, ThemeSetArgs, ThemeStyle } from 'claude-code'

import { makeColors } from './make-colors.js'

// Apple-inspired palette: system grays, system blue/red/green/orange/purple.
const { theme, problems } = makeColors({
  label: 'Apple Glass',
  roles: { accent: '#007aff', danger: '#ff3b30', success: '#34c759', warning: '#ff9500', pro: '#af52de' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#ececf1',
        'surface-1': '#f5f5f8',
        'surface-2': '#fbfbfd',
        'surface-3': '#fbfbfd',
        'text-primary': '#1d1d1f',
        'text-secondary': '#424245',
        'text-muted': '#5f5f64',
      },
    },
  },
  dark: {
    roles: { accent: '#0a84ff', danger: '#ff453a', success: '#30d158', warning: '#ff9f0a', pro: '#bf5af2' },
    gray: {
      anchors: {
        'surface-0': '#141416',
        'surface-1': '#1c1c1e',
        'surface-2': '#232325',
        'surface-3': '#2a2a2c',
        'text-primary': '#f5f5f7',
        'text-secondary': '#d1d1d6',
        'text-muted': '#a1a1a6',
      },
    },
  },
})

// iMessage-like bubbles: blue for you, light/dark card for Claude.
const inputs = theme.inputs as Record<string, Record<string, string>>
Object.assign((inputs.light ??= {}), {
  'bg-user-message': '#0a6cdf',
  'text-user-message': '#ffffff',
  'bg-assistant-message': '#ffffff',
  'text-assistant-message': '#1d1d1f',
})
Object.assign((inputs.dark ??= {}), {
  'bg-user-message': '#0a6cdf',
  'text-user-message': '#ffffff',
  'bg-assistant-message': '#2a2a2c',
  'text-assistant-message': '#f5f5f7',
})

const STYLE: ThemeStyle = {
  Text: { fontFamily: ['sans'], fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  Heading: { fontFamily: ['sans'], fontWeight: 'semibold', letterSpacing: 0 },
  UserMessage: {
    backgroundColor: 'bg-user-message',
    color: 'text-user-message',
    radius: 20,
    paddingX: 14,
    paddingY: 9,
    shadow: { y: 2, blur: 8, color: 'bg-user-message' },
  },
  AssistantMessage: {
    backgroundColor: 'bg-assistant-message',
    color: 'text-assistant-message',
    radius: 20,
    paddingX: 16,
    paddingY: 12,
    shadow: { y: 4, blur: 18, color: 'surface-0' },
  },
  ToolUse: {
    backgroundColor: 'surface-2',
    radius: 12,
    paddingX: 10,
    paddingY: 4,
  },
}

// Soft, slowly drifting color blobs (abstract, original) behind frosted panels.
const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<defs>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="90"/></filter>
</defs>
<style>
.bg { fill: #e9ecf4 }
.a { fill: #7fb2ff } .b { fill: #c9a7ff } .c { fill: #ffb3c7 } .d { fill: #8fe3d4 }
.blob { opacity: 0.85; transform-box: fill-box; transform-origin: center }
.a { animation: driftA 48s ease-in-out infinite alternate }
.b { animation: driftB 56s ease-in-out infinite alternate }
.c { animation: driftC 62s ease-in-out infinite alternate }
.d { animation: driftD 52s ease-in-out infinite alternate }
@keyframes driftA { from { transform: translate(0px, 0px) } to { transform: translate(140px, 90px) } }
@keyframes driftB { from { transform: translate(0px, 0px) } to { transform: translate(-160px, 70px) } }
@keyframes driftC { from { transform: translate(0px, 0px) } to { transform: translate(120px, -110px) } }
@keyframes driftD { from { transform: translate(0px, 0px) } to { transform: translate(-100px, -80px) } }
@media (prefers-color-scheme: dark) {
.bg { fill: #0b0b10 }
.a { fill: #1d4fbf } .b { fill: #5b2a9e } .c { fill: #9e2f63 } .d { fill: #0f6e66 }
.blob { opacity: 0.7 }
}
</style>
<rect class="bg" width="1600" height="1000"/>
<g filter="url(#soft)">
<circle class="blob a" cx="260" cy="220" r="320"/>
<circle class="blob b" cx="1350" cy="200" r="300"/>
<circle class="blob c" cx="1250" cy="860" r="340"/>
<circle class="blob d" cx="320" cy="850" r="300"/>
</g>
</svg>`

const BASE: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'apple-glass', glass: { blur: 40, opacity: 0.55 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) $.ui.toast(unpainted)

    let set
    try {
      set = await $.theme.set({ ...BASE, style: STYLE })
    } catch (error) {
      $.ui.log(String(error))
      set = await $.theme.set(BASE)
    }
    if (!set.isDrawn) $.ui.status(set.reason)

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    const { Svg } = $.ui.resolve(e)
    return <Svg source={SCENE} alt="Soft colored light drifting behind frosted glass" />
  })
}
