import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { LayoutGroup, motion, useReducedMotion, useSpring, useTransform } from 'motion/react'
import {
  ArrowDown, ArrowUpRight, Award, ChevronDown, ChevronLeft, ChevronRight, Eye, Heart,
  Mail, MapPin, Menu, MessageCircle, Music2, Pause, Phone, Play, Share2,
  RotateCcw, SkipForward, Sparkles, Star, Volume2, VolumeX, X
} from 'lucide-react'
import './styles.css'
import './pages.css'
import TiltedCard from './TiltedCard'
import VariableProximity from './VariableProximity'
import ZoomImage from './ZoomImage'
import CardSwap, { Card } from './CardSwap'
import CoverflowCarousel from './CoverflowCarousel'
import RotatingText from './RotatingText'
import CurvedLoop from './CurvedLoop'
import useEducationReveal from './useEducationReveal'
import bilibiliLogo from '../Photos/app logos new/哔哩哔哩.png'
import xiaohongshuLogo from '../Photos/app logos new/小红书.png'
import xhsWordmark from '../Photos/SVG/xhs.svg'
import douyinLogo from '../Photos/app logos new/抖音.png'
import kuaishouLogo from '../Photos/app logos new/快手.png'
import youtubeLogo from '../Photos/app logos new/Youtube.png'
import tiktokLogo from '../Photos/app logos new/TikTok.png'
import instagramLogo from '../Photos/app logos new/Ins.png'
import socialAvatar from '../Photos/头像.jpg'
import remakeBlankSpace from '../Photos/Contents/Remake/Blank Space 4_3.png'
import remakeBrat from '../Photos/Contents/Remake/BRAT 4_3.png'
import remakeBirds from '../Photos/Contents/Remake/BIRDS OF A FEATHER 4_3.png'
import motionCover from '../Photos/Contents/Apple Music/Apple Music 动态封面.png'
import motionStill from '../Photos/Contents/Apple Music/Apple Music 全屏不动态封面.png'
import motionArtist from '../Photos/Contents/Apple Music/Apple Music 艺术家页面.png'
import viralBrat from '../Photos/Contents/Viral/BRAT.png'
import viralMotion from '../Photos/Contents/Viral/Apple Music 动态封面.png'
import viralArtist from '../Photos/Contents/Viral/Apple Music 艺术家页面.png'
import viralSinger from '../Photos/Contents/Viral/Apple Music 歌手新页面.png'
import viralAi from '../Photos/Contents/Viral/AI封面.png'
import skillMusicImage from '../Photos/Skills/Music.webp'
import skillAiImage from '../Photos/Skills/AI.webp'
import skillVideosImage from '../Photos/Skills/Videos.webp'
import skillCodingImage from '../Photos/Skills/Coding.webp'
import studentWorkPhoto from '../Photos/学生工作.JPG'
import synthLeadOneImage from '../Photos/Synth Design/Lead 1.png'
import synthLeadTwoImage from '../Photos/Synth Design/Lead 2.png'
import synthSubBodyImage from '../Photos/Synth Design/Sub body.png'
import synthNoiseImage from '../Photos/Synth Design/Noiise.png'
import synthAirImage from '../Photos/Synth Design/Air.png'
import snarePhonkAudio from '../music/Blank Space Drum Layering/Snare 1/Phonk Snare.mp3'
import snareSmallWonderAudio from '../music/Blank Space Drum Layering/Snare 1/Small Wonder.mp3'
import snareSeismicAudio from '../music/Blank Space Drum Layering/Snare 1/Seismic.mp3'
import snareCasePhonkAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 1/Phonk Snare.mp3'
import snareCaseSmallWonderAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 1/Small Wonder.mp3'
import snareCaseSeismicAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 1/Seismic.mp3'
import snareCasePhonkEqAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 2/Phonk Snare.mp3'
import snareCaseSmallWonderEqAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 2/Small Wonder.mp3'
import snareCaseSeismicEqAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 2/Seismic.mp3'
import snareCaseCompressorAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 3/Compressor.mp3'
import snareCaseBusEqAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 3/EQ.mp3'
import snareCaseCompressorEqAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 3/Compressor + EQ.mp3'
import snareCaseFxEmptyAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 4/1 Empty + 2 Empty.mp3'
import snareCaseFxRoomAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 4/1 Empty + 2 Reverb.mp3'
import snareCaseFxChamberAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 4/1 Reverb + 2 Empty.mp3'
import snareCaseFxChamberRoomAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 4/1 Reverb + 2 Reverb.mp3'
import snareCaseFxDelayAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 4/1 Delay + 2 Empty.mp3'
import snareCaseFxDelayRoomAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 4/1 Delay + 2 Reverb.mp3'
import snareCaseFxChamberDelayAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 4/1 Reverb Delay + 2 Empty.mp3'
import snareCaseFxChamberDelayRoomAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 4/1 Reverb Delay + 2 Reverb.mp3'
import snareCaseOthersAudio from '../music/Blank Space Drum Layering/Snare 1 Detail/Step 5/Others.mp3'
import snare2BeyondTheStarsAudio from '../music/Blank Space Drum Layering/Snare 2/Beyond The Stars.mp3'
import snare2DetroidGarageAudio from '../music/Blank Space Drum Layering/Snare 2/Detroid Garage.mp3'
import snare3Clap1Audio from '../music/Blank Space Drum Layering/Snare 3/Clap 1.mp3'
import snare3Clap2Audio from '../music/Blank Space Drum Layering/Snare 3/Clap 2.mp3'
import snare3NoiseAudio from '../music/Blank Space Drum Layering/Snare 3/Noise.mp3'
import snare4FlexAudio from '../music/Blank Space Drum Layering/Snare 4/808 Flex.mp3'
import snare4FoundSoundAudio from '../music/Blank Space Drum Layering/Snare 4/Found Sound.mp3'
import snare4ClapAudio from '../music/Blank Space Drum Layering/Snare 4/Clap.mp3'
import kick1KickAudio from '../music/Blank Space Drum Layering/Kick 1/808 Kick.mp3'
import kick1SubKickAudio from '../music/Blank Space Drum Layering/Kick 1/808 Sub Kick.mp3'
import kick2BluebirdAudio from '../music/Blank Space Drum Layering/Kick 2/Bluebird.mp3'
import kick2KontaktAudio from '../music/Blank Space Drum Layering/Kick 2/Kontakt Pop Kit.mp3'
import kick2NoisyVinylAudio from '../music/Blank Space Drum Layering/Kick 2/Noisy Vinyl.mp3'
import kick2SnapbackAudio from '../music/Blank Space Drum Layering/Kick 2/Snapback.mp3'
import kick3AcousticBumpAudio from '../music/Blank Space Drum Layering/Kick 3/Acoustic Bump.mp3'
import kick3BluebirdAudio from '../music/Blank Space Drum Layering/Kick 3/Bluebird.mp3'
import kick3CrateDiggerAudio from '../music/Blank Space Drum Layering/Kick 3/Crate Digger.mp3'
import kick3KnickKnackAudio from '../music/Blank Space Drum Layering/Kick 3/Knick Knack.mp3'
import percussionImpactAudio from '../music/Blank Space Drum Layering/Percussion/Impact.mp3'
import percussionHumanOhAudio from '../music/Blank Space Drum Layering/Percussion/Human oh!.mp3'
import percussionTambourineAudio from '../music/Blank Space Drum Layering/Percussion/Tambourine.mp3'
import percussionShakerAudio from '../music/Blank Space Drum Layering/Percussion/Shaker.mp3'
import percussionThunderAudio from '../music/Blank Space Drum Layering/Percussion/Thunder.mp3'
import percussionCrashAudio from '../music/Blank Space Drum Layering/Percussion/Crash.mp3'
import percussionCrashReverseAudio from '../music/Blank Space Drum Layering/Percussion/Crash Reverse.mp3'
import othersVocalAudio from '../music/Blank Space Drum Layering/Others/Vocal.mp3'
import othersAudio from '../music/Blank Space Drum Layering/Others/Others.mp3'
import synthWithFilterOscAAudio from '../music/360 Synth Design/OCS with Filter/OSC A.mp3'
import synthWithFilterOscBAudio from '../music/360 Synth Design/OCS with Filter/OSC B.mp3'
import synthWithFilterSubBodyAudio from '../music/360 Synth Design/OCS with Filter/Sub body.mp3'
import synthWithFilterNoiseAudio from '../music/360 Synth Design/OCS with Filter/Noise.mp3'
import synthWithFilterAirAudio from '../music/360 Synth Design/OCS with Filter/Air.mp3'
import synthWithFilterOscABypassEnvelopeAudio from '../music/360 Synth Design/OCS with Filter/OSC A bypass envelope.mp3'
import synthWithFilterOscBBypassEnvelopeAudio from '../music/360 Synth Design/OCS with Filter/OSC B bypass envelope.mp3'
import synthWithoutFilterOscAAudio from '../music/360 Synth Design/OCS without Filter/OCS A.mp3'
import synthWithoutFilterOscBAudio from '../music/360 Synth Design/OCS without Filter/OCS B.mp3'
import synthWithoutFilterSubBodyAudio from '../music/360 Synth Design/OCS without Filter/Sub body.mp3'
import synthWithoutFilterNoiseAudio from '../music/360 Synth Design/OCS without Filter/Noise.mp3'
import synthWithoutFilterAirAudio from '../music/360 Synth Design/OCS without Filter/Air.mp3'
import synthWithoutFilterOscABypassEnvelopeAudio from '../music/360 Synth Design/OCS without Filter/OSC A bypass envelope.mp3'
import synthWithoutFilterOscBBypassEnvelopeAudio from '../music/360 Synth Design/OCS without Filter/OSC B bypass envelope.mp3'
import synthFilterEnvelopeBypassOscAAudio from '../music/360 Synth Design/OCS with Filter bypass envelope/OSC A.mp3'
import synthFilterEnvelopeBypassOscBAudio from '../music/360 Synth Design/OCS with Filter bypass envelope/OSC B.mp3'
import synthFilterEnvelopeBypassSubBodyAudio from '../music/360 Synth Design/OCS with Filter bypass envelope/Sub body.mp3'
import synthFilterEnvelopeBypassNoiseAudio from '../music/360 Synth Design/OCS with Filter bypass envelope/Noise.mp3'
import synthFilterEnvelopeBypassAirAudio from '../music/360 Synth Design/OCS with Filter bypass envelope/Air.mp3'
import synthFilterEnvelopeBypassOscABypassEnvelopeAudio from '../music/360 Synth Design/OCS with Filter bypass envelope/OSC A bypass envelope.mp3'
import synthFilterEnvelopeBypassOscBBypassEnvelopeAudio from '../music/360 Synth Design/OCS with Filter bypass envelope/OSC B bypass envelope.mp3'
import synthDawLeadAudio from '../music/360 Synth Design/DAW/Lead Synth.mp3'
import synthDawSubAudio from '../music/360 Synth Design/DAW/Sub Synth.mp3'
import synthDawChorusAudio from '../music/360 Synth Design/DAW/Chorus Synth.mp3'
import synthDawBuzzAudio from '../music/360 Synth Design/DAW/Buzz Synth.mp3'
import synthDawVocalAudio from '../music/360 Synth Design/DAW/Vocal.mp3'
import synthDawOthersAudio from '../music/360 Synth Design/DAW/Others.mp3'
import synthWithoutDelayAudio from '../music/360 Synth Design/Delay FX/Without Delay.mp3'
import synthDelayAudio from '../music/360 Synth Design/Delay FX/Delay.mp3'
import synthDelayWithLfoAudio from '../music/360 Synth Design/Delay FX/Delay + LFO.mp3'

const SCROLL_STATE_KEY = 'portfolio-scroll-state'
const RETURN_TO_ARRANGEMENT_KEY = 'portfolio-return-to-arrangement'
const SYNTH_PLAYBACK_CHANGE_EVENT = 'synth-playback-change'
const LIVE_AUDIO_SWITCH_FADE = .015
const LIVE_GAIN_SWITCH_FADE = .004

const announceSynthPlaybackStart = sectionId => {
  window.dispatchEvent(new CustomEvent(SYNTH_PLAYBACK_CHANGE_EVENT, { detail: { sectionId } }))
}

const audioContextOutputDelay = context => {
  if (!context) return 0
  const baseLatency = Number.isFinite(context.baseLatency) ? context.baseLatency : 0
  const outputLatency = Number.isFinite(context.outputLatency) ? context.outputLatency : 0
  return Math.max(0, baseLatency + outputLatency)
}

const audibleContextTime = context => {
  if (!context) return 0
  if (typeof context.getOutputTimestamp === 'function') {
    try {
      const timestamp = context.getOutputTimestamp()
      if (Number.isFinite(timestamp?.contextTime)) return Math.max(0, timestamp.contextTime)
    } catch {
      // Fall back to the browser-reported latency values below.
    }
  }
  return Math.max(0, context.currentTime - audioContextOutputDelay(context))
}

const audiblePlaybackPosition = (context, startsAt, startOffset, duration) => {
  if (!context || !duration) return startOffset || 0
  const elapsed = Math.max(0, audibleContextTime(context) - startsAt)
  return (startOffset + elapsed) % duration
}

const renderedPlaybackPosition = (context, startsAt, startOffset, duration) => {
  if (!context || !duration) return startOffset || 0
  const elapsed = Math.max(0, context.currentTime - startsAt)
  return (startOffset + elapsed) % duration
}

const rampGainImmediately = (gain, target, context) => {
  if (!gain || !context) return
  const startsAt = context.currentTime
  if (typeof gain.cancelAndHoldAtTime === 'function') {
    gain.cancelAndHoldAtTime(startsAt)
  } else {
    const currentValue = gain.value
    gain.cancelScheduledValues(startsAt)
    gain.setValueAtTime(currentValue, startsAt)
  }
  gain.linearRampToValueAtTime(target, startsAt + LIVE_GAIN_SWITCH_FADE)
}

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

const nav = [
  ['home', '首页'], ['strengths', '个人优势'], ['education', '教育经历'], ['works', '音乐作品'],
  ['social', '社交媒体'], ['skills', '技能与爱好'], ['contact', '联系我']
]

const musicTracks = [
  {
    title: 'Blank Space',
    artist: 'Taylor Swift (AUGUST REMAKE)',
    meta: '流行热单还原 · Sound Redesign',
    src: '/music/Blank Space.mp3',
    cover: '/albums/wall/35 - 1989.webp',
    video: 'https://www.bilibili.com/video/BV1xfYT6QEzg/?share_source=copy_web&vd_source=ce498b5e8850e269d4608ac666df0a42',
    tags: ['Drum Design', 'Layering', 'Synth Design', 'Serum'],
  },
  {
    title: '360',
    artist: 'Charli xcx (AUGUST REMAKE)',
    meta: '编曲拆解与全曲还原 · Logic Pro',
    src: '/music/360.mp3',
    cover: '/albums/wall/34 - BRAT.webp',
    video: 'https://www.bilibili.com/video/BV1B1tA6jECs/?share_source=copy_web&vd_source=ce498b5e8850e269d4608ac666df0a42',
    tags: ['Synth Design', 'Serum', 'Drum Programming', 'Texture Layering'],
  },
  {
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish (AUGUST REMAKE)',
    meta: '编曲拆解与全曲还原 · Logic Pro',
    src: '/music/BIRDS OF A FEATHER.mp3',
    cover: '/albums/wall/26 - HIT ME HARD AND SOFT.webp',
    video: 'https://www.bilibili.com/video/BV1qHut6NEUu/?share_source=copy_web&vd_source=ce498b5e8850e269d4608ac666df0a42',
    tags: ['Arrangement', 'Guitar Texture', 'Spatial Mix'],
  },
]

const arrangementDetails = [
  {
    eyebrow: 'BLANK SPACE · TAYLOR SWIFT',
    title: <>Drum<br/>Layering<span>.</span></>,
    description: '多个互补的鼓采样层，塑造干脆有力的鼓组质感。多个鼓组叠加混合，还原《Blank Space》鼓声的冲击力与生命力。',
    cover: '/albums/wall/35 - 1989.webp',
    coverAlt: 'Taylor Swift 专辑 1989 封面',
    quote: '“Nice to meet you, where you been?”',
    tags: ['Drum Design', 'Layering'],
    tone: 'blank-space',
    href: '#drum-layering',
  },
  {
    eyebrow: '360 · CHARLI XCX',
    title: <>Synth<br/>Design<span>.</span></>,
    description: '从波形、滤波、动态调制到效果器，赋予音色弹性与张力，还原《360》极具辨识度的代表性合成器。',
    cover: '/albums/wall/34 - BRAT.webp',
    coverAlt: 'Charli xcx 专辑 BRAT 封面',
    quote: '\"I\'m everywhere, I\'m so Julia\"',
    tags: ['合成器设计', 'Serum'],
    tone: 'three-sixty',
    href: '#synth-design',
  },
  {
    eyebrow: 'BIRDS OF A FEATHER · BILLIE EILISH',
    title: <>主题<br/>待定<span>.</span></>,
    description: '关于《BIRDS OF A FEATHER》的第三次声音拆解正在构思中，完整主题与交互内容即将补充。',
    cover: '/albums/wall/26 - HIT ME HARD AND SOFT.webp',
    coverAlt: 'Billie Eilish 专辑 HIT ME HARD AND SOFT 封面',
    quote: 'A new detail is still taking shape.',
    tags: ['ARRANGEMENT', '空间混音'],
    tone: 'birds',
    href: musicTracks[2].video,
  },
]

const DRUM_LAYERING_BPM = 96
const DRUM_LAYERING_BARS = 8
const DRUM_LAYERING_BEATS = 4
const DRUM_LAYERING_BAR_DURATION = 60 / DRUM_LAYERING_BPM * DRUM_LAYERING_BEATS
const DRUM_LAYERING_DURATION = DRUM_LAYERING_BAR_DURATION * DRUM_LAYERING_BARS
const drumLayeringStacks = [
  {
    id: 'snare-1',
    label: 'Snare 1',
    color: '#ac8aba',
    tracks: [
      { id: 'phonk-snare', label: 'Phonk Snare', src: snarePhonkAudio },
      { id: 'small-wonder', label: 'Small Wonder', src: snareSmallWonderAudio },
      { id: 'seismic', label: 'Seismic', src: snareSeismicAudio },
    ],
  },
  {
    id: 'snare-2',
    label: 'Snare 2',
    color: '#ac8aba',
    tracks: [
      { id: 'snare2-detroid-garage', label: 'Detroid Garage', src: snare2DetroidGarageAudio, sourceBars: 2, loopBars: 4 },
      { id: 'snare2-beyond-the-stars', label: 'Beyond The Stars', src: snare2BeyondTheStarsAudio, sourceBars: 2, loopBars: 4 },
    ],
  },
  {
    id: 'snare-3',
    label: 'Snare 3',
    color: '#ac8aba',
    tracks: [
      { id: 'snare3-clap-1', label: 'Clap 1', src: snare3Clap1Audio, sourceOffsetBars: 2, sourceBars: 2, loopBars: 2 },
      { id: 'snare3-clap-2', label: 'Clap 2', src: snare3Clap2Audio, sourceOffsetBars: 2, sourceBars: 2, loopBars: 2 },
      { id: 'snare3-noise', label: 'Noise', src: snare3NoiseAudio, loopBars: 2 },
    ],
  },
  {
    id: 'snare-4',
    label: 'Snare 4',
    color: '#ac8aba',
    tracks: [
      { id: 'snare4-808-flex', label: '808 Flex', src: snare4FlexAudio, loopBars: 1, startBar: 7, repeatCount: 2 },
      { id: 'snare4-found-sound', label: 'Found Sound', src: snare4FoundSoundAudio, loopBars: 1, startBar: 7, repeatCount: 2 },
      { id: 'snare4-clap', label: 'Clap', src: snare4ClapAudio, loopBars: 1, startBar: 7, repeatCount: 2 },
    ],
  },
  {
    id: 'kick-1',
    label: 'Kick 1',
    color: '#7d8faa',
    tracks: [
      {
        id: 'kick1-808-kick',
        label: '808 Kick',
        src: kick1KickAudio,
        loopBars: 2,
        hitDurationBeats: .75,
        hitBeats: [0, .75, 1.5, 4, 4.75, 5.5, 6.5],
      },
      {
        id: 'kick1-808-sub-kick',
        label: '808 Sub Kick',
        src: kick1SubKickAudio,
        loopBars: 2,
        hitDurationBeats: .75,
        hitBeats: [0, .75, 1.5, 4, 4.75, 5.5, 6.5],
      },
    ],
  },
  {
    id: 'kick-2',
    label: 'Kick 2',
    color: '#7d8faa',
    tracks: [
      { id: 'kick2-bluebird', label: 'Bluebird', src: kick2BluebirdAudio, loopBars: 4 },
      { id: 'kick2-snapback', label: 'Snapback', src: kick2SnapbackAudio, loopBars: 4 },
      { id: 'kick2-kontakt-pop-kit', label: 'Kontakt Pop Kit', src: kick2KontaktAudio, loopBars: 4 },
      { id: 'kick2-noisy-vinyl', label: 'Noisy Vinyl', src: kick2NoisyVinylAudio, loopBars: 4 },
    ],
  },
  {
    id: 'kick-3',
    label: 'Kick 3',
    color: '#7d8faa',
    tracks: [
      { id: 'kick3-acoustic-bump', label: 'Acoustic Bump', src: kick3AcousticBumpAudio, loopBars: 2 },
      { id: 'kick3-bluebird', label: 'Bluebird', src: kick3BluebirdAudio, loopBars: 2 },
      { id: 'kick3-crate-digger', label: 'Crate Digger', src: kick3CrateDiggerAudio, loopBars: 2 },
      { id: 'kick3-knick-knack', label: 'Knick Knack', src: kick3KnickKnackAudio, loopBars: 2 },
    ],
  },
  {
    id: 'percussion',
    label: 'Percussion',
    color: '#9aaa78',
    tracks: [
      { id: 'percussion-impact', label: 'Impact', src: percussionImpactAudio, loopBars: 1, repeatEveryBars: 2 },
      { id: 'percussion-human-oh', label: 'Human oh!', src: percussionHumanOhAudio, loopBars: 1, repeatEveryBars: 2 },
      { id: 'percussion-tambourine', label: 'Tambourine', src: percussionTambourineAudio, sourceBars: 1, sourceOffsetBars: 1, loopBars: 1, repeatCount: 8 },
      { id: 'percussion-shaker', label: 'Shaker', src: percussionShakerAudio, loopBars: 8, repeatCount: 1 },
      {
        id: 'percussion-crash',
        label: 'Crash',
        segments: [
          { id: 'crash', src: percussionCrashAudio, startBar: 1, bars: 2 },
          { id: 'crash-reverse', src: percussionCrashReverseAudio, startBar: 7, bars: 2 },
        ],
      },
      { id: 'percussion-thunder', label: 'Thunder', src: percussionThunderAudio, sourceBars: 1.5, loopBars: 1.5, repeatCount: 1, repeatSource: false },
    ],
  },
]
const drumLayeringStandaloneTracks = [
  { id: 'vocal', label: 'Vocal', src: othersVocalAudio, color: '#b69a70', loopBars: 8, repeatCount: 1 },
  { id: 'others', label: 'Others', src: othersAudio, color: '#b69a70', loopBars: 8, repeatCount: 1 },
]
const drumLayeringTracks = [
  ...drumLayeringStacks.flatMap(stack => stack.tracks),
  ...drumLayeringStandaloneTracks,
]
const drumLayeringTrackParents = new Map(drumLayeringStacks.flatMap(stack =>
  stack.tracks.map(track => [track.id, stack.id]),
))
const drumLayeringPreloadSources = [...new Set(
  drumLayeringTracks.flatMap(track => (
    track.segments?.map(segment => segment.src) || [track.src]
  )),
)]

const SNARE_CASE_BARS = 2
const SNARE_CASE_BEAT_DURATION = 60 / DRUM_LAYERING_BPM
const SNARE_CASE_DURATION = SNARE_CASE_BARS * DRUM_LAYERING_BEATS * SNARE_CASE_BEAT_DURATION
const SNARE_CASE_OTHERS_BARS = 8
const SNARE_CASE_OTHERS_DURATION = SNARE_CASE_OTHERS_BARS * DRUM_LAYERING_BEATS * SNARE_CASE_BEAT_DURATION
const SNARE_CASE_MASTER_GAIN = 1.6
const SNARE_CASE_WAVEFORM_WINDOW = .34
const SNARE_CASE_WAVEFORM_OFFSET = .615
const SNARE_CASE_PEAK_POSITION = .09
const SNARE_CASE_SCAN_TAIL_DURATION = SNARE_CASE_BEAT_DURATION
const SNARE_CASE_SCAN_PREROLL = SNARE_CASE_SCAN_TAIL_DURATION * SNARE_CASE_PEAK_POSITION / (1 - SNARE_CASE_PEAK_POSITION)
const SNARE_CASE_COMPRESSOR_VISUAL_ATTACK = .08
const SNARE_CASE_COMPRESSOR_VISUAL_RELEASE = .42
const SNARE_CASE_MAX_GAIN_REDUCTION = 1
const SNARE_CASE_BUS_EQ_LOOKAHEAD = .14
const SNARE_CASE_HIT_TIMES = Array.from({ length: SNARE_CASE_BARS }, (_, bar) => (
  [1, 3].map(beat => (bar * DRUM_LAYERING_BEATS + beat) * SNARE_CASE_BEAT_DURATION)
)).flat()
const snareCaseLayers = [
  {
    id: 'phonk-snare',
    no: '01',
    label: 'Phonk Snare',
    role: 'BODY / WEIGHT',
    src: snareCasePhonkAudio,
    eqSrc: snareCasePhonkEqAudio,
    gain: .52,
    alignment: {
      aligned: { seconds: 0, percent: 3.6 },
      loose: { seconds: 0, percent: 3.6 },
    },
  },
  {
    id: 'small-wonder',
    no: '02',
    label: 'Small Wonder',
    role: 'ATTACK / SNAP',
    src: snareCaseSmallWonderAudio,
    eqSrc: snareCaseSmallWonderEqAudio,
    gain: .38,
    alignment: {
      aligned: { seconds: 0, percent: 3.6 },
      loose: { seconds: 0, percent: 2.2 },
    },
  },
  {
    id: 'seismic',
    no: '03',
    label: 'Seismic',
    role: 'AIR',
    src: snareCaseSeismicAudio,
    eqSrc: snareCaseSeismicEqAudio,
    gain: .4,
    alignment: {
      aligned: { seconds: 0, percent: 3.6 },
      loose: { seconds: .052, percent: 2.6 },
    },
  },
]

const getStrengths = total => [
  { no: '01', title: '计算机 × 音乐', text: <>浙江大学计算机专业背景<br />专业第一与国家奖学金获得者<br />精通 AIGC 与大模型的原理与实践</>, tag: 'CS × MUSIC' },
  { no: '02', title: '流行音乐制作', text: <>具备完整拆解与重建欧美流行热单的实践经验<br />熟练使用 Logic Pro 与 Serum 合成器</>, tag: 'Production · Logic Pro' },
  { no: '03', title: <>AIGC <span className="title-tail">音乐工作流</span></>, text: <>具备 Suno 音乐制作的经验<br />能将 AI Agent 融入音乐企划与制作流程</>, tag: 'Suno · AI Agent' },
  { no: '04', title: '音乐内容运营', text: <>独立完成音乐内容的选题策划、制作、视觉与多平台分发<br />收获{formatMetric(total.views)}浏览与{formatMetric(total.engagement)}互动</>, tag: '策划 · 制作 · 分发' },
]

const FOLLOWER_CHART = { width: 760, height: 236, left: 58, right: 0, top: 20, bottom: 18 }
const VIEWS_CHART_TICKS = [600000, 550000, 500000, 450000]

function makeSmoothChartPath(points) {
  if (!points.length) return ''
  if (points.length === 1) return `M${points[0].x} ${points[0].y}`
  const commands = [`M${points[0].x} ${points[0].y}`]
  const tension = .72
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)]
    const current = points[index]
    const next = points[index + 1]
    const following = points[Math.min(points.length - 1, index + 2)]
    const controlOneX = current.x + (next.x - previous.x) / 6 * tension
    const controlOneY = current.y + (next.y - previous.y) / 6 * tension
    const controlTwoX = next.x - (following.x - current.x) / 6 * tension
    const controlTwoY = next.y - (following.y - current.y) / 6 * tension
    commands.push(`C${controlOneX} ${controlOneY} ${controlTwoX} ${controlTwoY} ${next.x} ${next.y}`)
  }
  return commands.join(' ')
}

function niceChartStep(value) {
  if (!Number.isFinite(value) || value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return factor * magnitude
}

function buildFollowerChart(history, valueKey = 'fans', fixedTicks = null) {
  const validHistory = (Array.isArray(history) ? history : []).filter(point => (
    /^\d{4}-\d{2}-\d{2}$/.test(point?.date) && Number.isFinite(Number(point?.[valueKey]))
  ))
  if (!validHistory.length) return null

  const values = validHistory.map(point => Number(point[valueKey]))
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const range = maximum - minimum || Math.max(maximum * .05, 1)
  const step = niceChartStep(range * 1.16 / 3)
  let chartMinimum = fixedTicks ? Math.min(...fixedTicks) : Math.floor((minimum - range * .08) / step) * step
  let chartMaximum = fixedTicks ? Math.max(...fixedTicks) : Math.ceil((maximum + range * .08) / step) * step
  if (chartMaximum === chartMinimum) chartMaximum += step
  const plotWidth = FOLLOWER_CHART.width - FOLLOWER_CHART.left - FOLLOWER_CHART.right
  const plotHeight = FOLLOWER_CHART.height - FOLLOWER_CHART.top - FOLLOWER_CHART.bottom
  const points = validHistory.map((point, index) => ({
    x: FOLLOWER_CHART.left + (validHistory.length === 1 ? 0 : index / (validHistory.length - 1)) * plotWidth,
    y: FOLLOWER_CHART.top + (chartMaximum - Number(point[valueKey])) / (chartMaximum - chartMinimum) * plotHeight,
  }))
  const yTicks = fixedTicks
    ? fixedTicks.map(value => ({
      value,
      y: FOLLOWER_CHART.top + (chartMaximum - value) / (chartMaximum - chartMinimum) * plotHeight,
    }))
    : []
  if (!fixedTicks) {
    for (let value = chartMaximum; value >= chartMinimum - step / 2; value -= step) {
      yTicks.push({
        value: Math.round(value * 1e8) / 1e8,
        y: FOLLOWER_CHART.top + (chartMaximum - value) / (chartMaximum - chartMinimum) * plotHeight,
      })
    }
  }
  const linePath = makeSmoothChartPath(points)
  const baseY = FOLLOWER_CHART.height - FOLLOWER_CHART.bottom
  const areaPath = `${linePath} L${points.at(-1).x} ${baseY} L${points[0].x} ${baseY} Z`
  const labelIndexes = [...new Set([0, 7, 14, 21, validHistory.length - 1])]
  const labels = labelIndexes.map(index => validHistory[Math.min(index, validHistory.length - 1)].date)
  const first = values[0]
  const latest = values.at(-1)
  const latestMonth = validHistory.at(-1).date.slice(0, 7)
  const firstCurrentMonthIndex = validHistory.findIndex(point => point.date.startsWith(latestMonth))
  const monthBaselineIndex = Math.max(0, firstCurrentMonthIndex - 1)
  const monthGain = latest - values[monthBaselineIndex]
  const periodGain = latest - first
  const growthRate = first ? (latest - first) / first * 100 : null

  return { linePath, areaPath, labels, yTicks, first, latest, monthGain, periodGain, growthRate }
}

function formatFollowerChartDate(value) {
  const [, month, day] = value.split('-').map(Number)
  return `${month}月${day}日`
}

const strengthStories = [
  {
    no: '01', tone: 'gray-one', kicker: 'LEARNING & RESEARCH & AI WORKFLOWS', title: <>扎实的技术底色，<br/>持续进阶的能力。</>,
    lead: '浙江大学计算机本硕背景，让我具备扎实的知识基础与快速学习的能力。从生成式 AI 研究到 Agent 工作流实践，我把对技术的理解，转化为分析问题、验证想法与推进工作的能力。',
    points: [
      { label: 'ACADEMIC EXCELLENCE', value: '专业第一 · 两次国奖', text: '浙江大学软件工程本科 GPA 3.98 / 4.0，专业排名 1 / 85，推免攻读计算机科学与技术硕士。' },
      { label: 'AIGC RESEARCH & PRACTICE', value: '模型理解', text: '研究 AIGC 与 Diffusion，代表作 SNR-Edit 录用于 ACM MM 2026；在腾讯优图实验室参与百万级图像生成与质量评估。' },
      { label: 'AGENT WORKFLOWS', value: '熟练掌握 Agent 协作', text: '将 WorkBuddy、Codex 等工具用于研究实验、代码开发与资料整理，把重复任务组织成自动化流程，提升工作效率。' },
    ],
    note: '技术能力是在持续学习和研究中积累起来的。',
    noteLink: { href: '#education', label: '走进我的教育经历' }
  },
  {
    no: '02', tone: 'black', kicker: 'POP MUSIC PRODUCTION', title: <>持续的还原实践，<br/>扎实的制作能力。</>,
    lead: '以 Logic Pro 为主要工具，持续完成欧美热单的编曲拆解与还原，积累编曲、音色设计与混音经验。从鼓组采样的分层组合，到合成器的精心设计，我打磨每个声音的质感，也关注它们如何构成完整的听感。',
    points: [
      { label: 'PRODUCTION EXPERIENCE', value: '多首完整作品实践', text: '完成多首欧美热单的编曲还原，在不同节奏、音色与配器风格中积累制作经验。' },
      { label: 'SOUND DESIGN', value: '鼓组分层 × 合成器设计', text: '从作品需要的听感出发，选择、组合并调整不同声音，塑造有辨识度的音色，让局部细节服务于整首歌的表达。' },
      { label: 'AUDIENCE RESPONSE', value: null, text: '将编曲还原作品发布至多个社交平台，获得广泛好评；收获对音色相似度的积极评价，也引发了编曲技术的友好交流。' },
    ],
    note: '每一次拆解与重建，最终都要回到作品本身。',
    noteLink: { href: '#works', label: '聆听我的作品' }
  },
  {
    no: '03', tone: 'lime', kicker: 'AIGC MUSIC WORKFLOW', title: <>让生成成为起点，<br/>而不是成品。</>,
    lead: '我希望把 AIGC 放进完整的音乐企划与制作链路：先明确创作方向，再通过 Prompt 与生成工具探索素材，最后回到 DAW 中进行结构、音色与混音层面的二次制作。',
    points: [
      { label: '01 · DIRECTION', value: '企划与 Prompt', text: '先定义情绪、风格、受众与参考坐标，让生成过程服务于明确的表达。' },
      { label: '02 · GENERATION', value: 'Suno 探索', text: '快速比较旋律、编配和声音方向，筛选值得继续发展的创作素材。' },
      { label: '03 · REBUILD', value: 'DAW 二次制作', text: '把生成结果带回制作工程，继续完成取舍、重构、混音与质量控制。' },
    ],
    note: '这一部分目前作为工作流框架，后续可替换为完整项目案例与试听内容。'
  },
  {
    no: '04', tone: 'gray-two', kicker: 'MUSIC CONTENT OPERATION', title: <><span className="operation-title-line">社交媒体运营，</span><span className="operation-title-line">音乐被看见与回应。</span></>,
    lead: '把对欧美流行音乐的兴趣延伸为可以持续更新的内容，独立完成音乐内容的策划、制作与发布，并根据观众反馈调整表达方式，让不同形式的作品汇成有辨识度的内容方向。',
    points: [
      { label: 'CONTENT OUTPUT', value: null, text: '持续发布欧美流行音乐相关内容，覆盖多个社交平台，逐步建立稳定的内容产出与传播规模。' },
      { label: 'AUDIENCE ENGAGEMENT', value: null, text: '从零积累受众，收获观众的点赞、收藏与讨论，也在反馈中逐步形成自己的内容表达。' },
      { label: 'CONTENT PILLARS', value: '编曲还原 · 音乐与设计', text: '以欧美热单编曲还原和 Apple Music 音乐与设计为两条主要内容线，同时筹备翻唱作品，拓展音乐表达的形式。' },
    ],
    note: '一份音乐内容如何被看见、被讨论，可以从作品与数据中找到答案。',
    noteLink: { href: '#social', label: '了解社交媒体' }
  },
]

const educationStories = [
  {
    no: '01', tone: 'gray-one', kicker: 'ACADEMIC EXCELLENCE', title: <>优秀成绩的内核，<br/>是沉淀下来的能力。</>,
    lead: '不仅有亮眼的综合成绩，在音乐、英语、计算机等不同领域中都有不俗表现。于我而言，学习能力不仅是分数，更是快速理解、持续执行与可靠交付。',
    points: [
      { label: 'GPA & RANKING', value: '3.98 / 4.0', text: '浙江大学软件工程本科专业排名 1 / 85，以扎实的课程表现完成本科学习。' },
      { label: 'COURSE RECORD', value: '97 / 95', text: '视唱练耳 97 分、歌唱艺术 95 分，在计算机主修之外持续建立音乐基础能力。' },
      { label: 'HONORS', value: '2× 国家奖学金', text: '获一等奖学金（前 3%），并获评浙江省优秀毕业生。' },
    ],
    note: '把复杂知识拆开理解，把长期目标拆成每一次可完成的行动。'
  },
  {
    no: '02', tone: 'lime', kicker: 'AI RESEARCH & PRACTICE', title: <>掌握 AI，<br/>拥抱 AI。</>,
    lead: '以生成式 AI 为研究主线，持续探索图像生成与编辑，掌握生成模型的基本原理，具备生成质量评估的能力，可触类旁通地应用到 AI 音乐领域。',
    points: [
      { label: 'RESEARCH FOCUS', value: 'AIGC × 多模态', text: '研究方向覆盖 AIGC、多模态大模型、Diffusion、图像生成与编辑，关注结构保持与可控性、生成质量的评估。' },
      { label: 'PUBLICATION', value: 'SNR-Edit', text: <><a href="https://arxiv.org/pdf/2601.19180" target="_blank" rel="noreferrer">SNR-Edit: Structure-Aware Noise Rectification for Inversion-Free Flow-Based Editing</a>，录用于 ACM MM 2026。</> },
      { label: 'AI PRACTICE', value: '腾讯优图实验室', text: '担任图像生成算法实习生，参与百万级掌纹图像生成、质量评估与问题定位，并使用 AI Agent 优化研究与工程工作流。' },
    ],
  },
  {
    no: '03', tone: 'black', kicker: 'CAMPUS LEADERSHIP', title: <>学生工作经历，<br/><span className="campus-title-line">协调于行负责于心。</span></>,
    lead: '在浙江大学学生会“学生综合素质与管理中心”担任办公室部长，负责跨部门管理与协作，参与重大活动落地，包括学院新年晚会、杨华勇院士讲座等高规格活动。',
    points: [
      { label: 'ROLE', value: '办公室部长', text: '2021.09 — 2023.06，参与学生组织日常管理、跨部门协调，并承担大型活动的执行职责。' },
      { label: 'EVENT COORDINATION', value: '4 部门 · 50+ 人', text: '统筹新年晚会物资、节目与流程，对接多部门工作人员与参演人员，保障活动零失误落地。' },
      { label: 'CONTENT REVIEW', value: '新年晚会节目审核', text: '负责音乐类节目的筛选与审核，并协调入选节目的排练排期、设备需求与现场执行。' },
    ],
    image: studentWorkPhoto,
    imageAlt: '浙江大学新年晚会工作人员合影',
    note: '新年晚会工作人员合影。本人位于右一。',
    withFooter: true,
  },
]

const courseRecords = {
  音乐: [
    ['视唱练耳', '97'],
    ['歌唱艺术', '95'],
  ],
  英语: [
    ['CET-4', '654'],
    ['CET-6', '612'],
  ],
  计算机: [
    ['数据结构基础', '99'],
    ['操作系统', '96'],
    ['面向对象程序设计', '97'],
  ],
  数学: [
    ['概率论与数理统计', '100'],
    ['微积分', '99'],
  ],
}

const audienceProfiles = {
  bilibili: {
    name: '哔哩哔哩',
    age: [['0–16', '10.3%'], ['16–25', '49.7%'], ['25–40', '30.3%'], ['>40', '9.7%']],
    gender: [['女性', '10.8%'], ['男性', '89.2%']],
    regions: [['广东', '11.6%'], ['上海', '9.2%'], ['江苏', '7.5%'], ['四川', '6.4%'], ['浙江', '5.8%']],
    interests: ['音乐', '欧美音乐', 'Apple Music', '欧美歌手', '编曲', '视觉设计'],
  },
  rednote: {
    name: '小红书',
    age: [['<18', '12%'], ['18–24', '45%'], ['25–34', '27%'], ['35-44', '7%'], ['>44', '6%']],
    gender: [['女性', '26%'], ['男性', '74%']],
    regions: [['上海', '9%'], ['杭州', '8%'], ['北京', '5%'], ['天津', '4%'], ['成都', '3%']],
    interests: ['音乐', '欧美音乐', 'Apple Music', '编曲', '生活方式', '科技数码'],
  },
  tiktok: {
    name: 'TikTok',
    age: [['18–24', '39.7%'], ['25–34', '43.4%'], ['35–44', '10.3%'], ['45-54', '5.0%'], ['>55', '1.6%']],
    gender: [['女性', '40%'], ['男性', '59%'], ['其他', '1%']],
    regions: [['美国', '31.8%'], ['墨西哥', '14.0%'], ['巴西', '8.6%'], ['日本', '6.0%'], ['越南', '5.8%']],
    interests: ['Music', 'Pop Music', 'Apple Music', 'Music Production', 'Visual Design'],
  },
}

const platformDefinitions = [
  {
    key: 'bilibili', name: '哔哩哔哩', icons: [bilibiliLogo], featured: true,
  },
  {
    key: 'rednote', name: '小红书', icons: [xiaohongshuLogo], featured: true, viewLabel: '阅读',
  },
  { key: 'douyin', name: '抖音', icons: [douyinLogo] },
  { key: 'kuaishou', name: '快手', icons: [kuaishouLogo] },
  {
    keys: ['youtube', 'tiktok', 'instagram'], name: '海外运营：YouTube + TikTok + Instagram', titleLead: '海外运营：', titleTail: 'YouTube + TikTok + Instagram', icons: [youtubeLogo, tiktokLogo, instagramLogo], featured: true, neutral: true,
  },
]

const engagementFields = ['likes', 'saves', 'coins', 'comments', 'danmakus', 'shares']
const socialPlatformNames = {
  bilibili: '哔哩哔哩', rednote: '小红书', douyin: '抖音', kuaishou: '快手',
  youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram',
}

const fallbackSocialData = {
  bilibili: { views: 180000, engagement: 7400, fans: 170 },
  rednote: { views: 150000, engagement: 9400, fans: 160 },
  douyin: { views: 38000, engagement: 950, fans: 0 },
  kuaishou: { views: 170000, engagement: 1000, fans: 0 },
  youtube: { views: 52000, engagement: 2900, fans: 250 },
  tiktok: { views: 0, engagement: 0, fans: 0 },
  instagram: { views: 0, engagement: 0, fans: 0 },
  total: {
    views: 600000, fans: 660, likes: 13000, saves: 4000, coins: 1000,
    comments: 2000, danmakus: 500, shares: 500, engagement: 21000,
  },
  apple_music: { views: 471847, engagement: 16487 },
  remake: { views: 23709, engagement: 1511 },
}

function toMetricNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function formatMetric(value) {
  if (value == null) return '—'
  const number = toMetricNumber(value)
  if (number >= 10000) {
    const compact = number / 10000
    const digits = compact >= 100 ? 0 : 1
    return `${compact.toFixed(digits).replace(/\.0$/, '')}万`
  }
  return new Intl.NumberFormat('zh-CN').format(number)
}

function MetricValue({ value }) {
  const formatted = formatMetric(value)
  if (!formatted.endsWith('万')) return formatted
  return <>{formatted.slice(0, -1)}<sup>万</sup></>
}

function platformEngagement(platform = {}) {
  if (Number.isFinite(Number(platform.engagement))) return Number(platform.engagement)
  return engagementFields.reduce((sum, field) => sum + toMetricNumber(platform[field]), 0)
}

function mergePlatformData(data, keys) {
  return keys.reduce((result, key) => {
    const platform = data[key] || {}
    result.views += toMetricNumber(platform.views)
    result.fans += toMetricNumber(platform.fans)
    result.engagement += platformEngagement(platform)
    return result
  }, { views: 0, fans: 0, engagement: 0 })
}

function makePlatformCards(data) {
  return platformDefinitions.map(definition => {
    const metrics = mergePlatformData(data, definition.keys || [definition.key])
    const stats = [
      [metrics.views, definition.viewLabel || '观看'],
      [metrics.engagement, '互动'],
      ...(['douyin', 'kuaishou'].includes(definition.key) ? [] : [[metrics.fans, '粉丝']]),
    ]
    return { ...definition, stats }
  })
}

const socialChannels = [
  { name: '哔哩哔哩', icon: bilibiliLogo, id: '@August-小八', url: 'https://space.bilibili.com/512101041' },
  { name: '小红书', icon: xiaohongshuLogo, id: '@August_pp', url: 'https://xhslink.cn/o/AYwpy9DqQTa' },
  { name: '抖音', icon: douyinLogo, id: '@August_Hachiware', url: 'https://www.douyin.com/user/MS4wLjABAAAAhz0g4b1t_2SZO58DIwjp5E0EgQ7K0Tdu4VOopT-Shv8qSl5RnrYFgXO3PbY6ZWXA' },
  { name: '快手', icon: kuaishouLogo, id: '@August_Hachiware', url: 'https://v.kuaishou.com/KhZSw0Kz' },
  { name: 'YouTube', icon: youtubeLogo, id: '@august-hachiware', url: 'https://www.youtube.com/@august-hachiware' },
  { name: 'TikTok', icon: tiktokLogo, id: '@august_hachiware', url: 'https://www.tiktok.com/@august_hachiware?_r=1&_t=ZS-99kXrIqeHHm' },
  { name: 'Instagram', icon: instagramLogo, id: '@august_hachiware', url: 'https://www.instagram.com/august_hachiware/' },
]

const socialProfileTags = ['欧美流行音乐', '编曲还原', '动态封面', 'AIGC 音乐', 'Apple Music', '热门翻唱']

const socialContentPillars = [
  { no: '01', dataKey: 'remake', label: 'ARRANGEMENT REMAKE', title: '编曲还原', text: '拆解欧美流行热单的结构、音色与制作逻辑，重新构建一首歌的听觉层次，用完整还原展示制作能力。', works: [
    { title: 'Blank Space', image: remakeBlankSpace, url: 'https://www.bilibili.com/video/BV1xfYT6QEzg/?spm_id_from=333.1387.homepage.video_card.click' },
    { title: 'BRAT', image: remakeBrat, url: 'https://www.bilibili.com/video/BV1B1tA6jECs/?spm_id_from=333.1387.homepage.video_card.click' },
    { title: 'BIRDS OF A FEATHER', image: remakeBirds, url: 'https://www.bilibili.com/video/BV1qHut6NEUu/?spm_id_from=333.1387.upload.video_card.click' },
  ] },
  { no: '02', dataKey: 'apple_music', label: 'APPLE MUSIC', title: 'Apple Music 音乐 & 设计', text: '呈现 Apple Music 的设计审美，追踪 Apple Music 最新功能，把音乐与视觉审美相结合。', works: [
    { title: 'Apple Music 动态封面', image: motionCover, wide: true, url: '' },
    { title: 'Apple Music 静态封面', image: motionStill, url: '' },
    { title: 'Apple Music 艺术家页面', image: motionArtist, wide: true, url: '' },
  ] },
  { no: '03', label: 'VOCAL COVER', title: '翻唱', text: '以声音演绎拓展内容形态，第一支翻唱作品正在筹备中。', views: 0, engagement: 0, works: [
    { title: '首支翻唱 · 筹备中', image: null, url: '' },
  ] },
]

const socialViralWorks = [
  {
    no: '01', dataKey: 'brat_remake', line: 'BRAT - 360 编曲还原', label: 'ARRANGEMENT REMAKE', title: 'BRAT - 360 编曲还原', titleLines: ['BRAT - 360', '编曲还原'],
    coreTags: ['编曲拆解', '制作还原', '高互动率'],
    description: '我将《360》的编曲还原项目分享至网络，公开呈现了详细的编曲工程文件。作品在多个平台获得较高观看量与大量好评，创下个人最高互动率。不少观众惊叹于还原版与原曲的高度相似，也围绕编曲技术展开了友好讨论与经验分享。',
    image: viralBrat, imageAlt: 'BRAT 作品封面',
  },
  {
    no: '02', dataKey: 'apple_music_animated_cover_ep1', line: 'Apple Music 动态封面 Ep1', label: 'ANIMATED COVER', title: 'Apple Music 动态封面 Ep1', titleLines: ['Apple Music', '动态封面 Ep1'],
    coreTags: ['动态封面', '多元选材', '视觉审美'],
    description: '我个人的第一个作品，也是 Apple Music 系列的开篇。视频集合了大量知名专辑的动态封面。我在选材时兼顾热点与多元：既有 Taylor Swift《The Life of a Showgirl》、单依纯《纯妹妹》、i-dle《Mono》等时下热门作品，也覆盖说唱（Drake）、摇滚（披头士）、另类（Magdalena Bay）、音乐剧（汉密尔顿）以及华语经典（Beyond）等多个方向。发布后短时间内获得了较高的浏览与互动。',
    image: viralMotion, imageAlt: 'Apple Music 动态封面作品封面',
  },
  {
    no: '03', dataKey: 'apple_music_ai_cover', line: 'Apple Music AI 封面', label: 'AI COVER', title: 'Apple Music AI 封面', titleLines: ['Apple Music', 'AI 封面'],
    coreTags: ['AIGC', '争议话题', '观众共鸣', '高互动量'],
    description: '我捕捉到网络上对 AI 封面的“恐怖谷效应”的普遍不满，并以此为主题，在作品中集合了孙燕姿、那英、蔡依林等华语乐坛知名歌手的 AI 动态封面。视频发布后，引发了大量观众对 AI 封面的吐槽共鸣，观看量与互动量创下新高。',
    image: viralAi, imageAlt: 'Apple Music AI 封面作品封面',
  },
  {
    no: '04', dataKey: 'apple_music_artist_page_1', line: 'Apple Music 歌手页面1', label: 'ARTIST PAGE', title: 'Apple Music 歌手页面 1', titleLines: ['Apple Music', '歌手页面 1'],
    coreTags: ['紧跟热点', '界面设计', '审美传播'],
    description: '紧跟苹果公司 iOS 27 系统发布的热点，我整理并发布了 Apple Music 全新设计的歌手页面。视频发布后成为爆款，大量观众对苹果的设计与审美表示认可与欣赏。',
    image: viralSinger, imageAlt: 'Apple Music 歌手新页面作品封面',
  },
  {
    no: '05', dataKey: 'apple_music_classical_artist_page', line: 'Apple Music 音乐家页面', label: 'CLASSICAL ARTIST PAGE', title: 'Apple Music 音乐家页面', titleLines: ['Apple Music', '音乐家页面'],
    coreTags: ['古典音乐', '稀缺题材', '内容发现', '高互动率'],
    description: '我注意到网络上几乎没有关于古典音乐家 Apple Music 个人页面的分享内容，因此制作了这支视频，集合多位知名古典音乐家的个人页面设计。由于题材稀缺，视频一经发布便获得大量观看与互动；观众不仅高度赞同苹果的审美，也被激发起对古典音乐的尊重与认可。',
    image: viralArtist, imageAlt: 'Apple Music 音乐家页面作品封面',
  },
]

const skillGroups = [
  { title: '音乐制作', image: skillMusicImage, items: ['Suno', 'Logic Pro', 'Serum', '编曲拆解', '音色设计', '音乐鉴赏', '视唱练耳', '双排键十级'] },
  { title: 'AI技术', image: skillAiImage, items: ['Codex', 'Claude Code', 'WorkBuddy', 'Cursor', 'AIGC模型', 'Diffusion', '多模态大模型'] },
  { title: '内容创作', image: skillVideosImage, items: ['Premiere', 'Final Cut', 'Photoshop', 'Figma', '内容策划', '数据分析', '社交媒体运营'] },
  { title: '编程', image: skillCodingImage, items: ['Python', 'PyTorch', 'C/C++', '前端', '数据库'] },
]

const skillImageCache = []
function preloadSkillImages() {
  if (skillImageCache.length) return
  skillGroups.forEach(({ image: src }) => {
    const image = new Image()
    image.src = src
    image.decode?.().catch(() => {})
    skillImageCache.push(image)
  })
}

const recentAlbums = [
  { title: 'Lost Weekend', subtitle: 'Phoebe Bridgers', src: '/albums/recent/Lost Weekend.webp', alt: 'Lost Weekend 专辑封面' },
  { title: 'West End Girl', subtitle: 'Lily Allen', src: '/albums/recent/West End Girl.webp', alt: 'West End Girl 专辑封面' },
  { title: 'Day and Night', subtitle: 'Carly Rae Jepsen', src: '/albums/recent/Day and Night.webp', alt: 'Day and Night 专辑封面' },
  { title: 'Bass Persuades', subtitle: 'Miley Cyrus', src: '/albums/recent/Bass Persuades.webp', alt: 'Bass Persuades 专辑封面' },
  { title: 'Location', subtitle: 'She Her Her Hers', src: '/albums/recent/Location.webp', alt: 'Location 专辑封面' },
  { title: 'We Are', subtitle: 'Jon Batiste', src: '/albums/recent/We Are.webp', alt: 'We Are 专辑封面' },
  { title: 'Women in Music Pt. III', subtitle: 'HAIM', src: '/albums/recent/Women in Music Pt. III.webp', alt: 'Women in Music Pt. III 专辑封面' },
  { title: 'you seem pretty sad for a girl so in love', subtitle: 'Olivia Rodrigo', src: '/albums/recent/you seem pretty sad for a girl so in love.webp', alt: 'you seem pretty sad for a girl so in love 专辑封面' },
  { title: 'The Life of a Showgirl: The Encore', subtitle: 'Taylor Swift', src: '/albums/recent/The Life of a Showgirl - The Encore.webp', alt: 'The Life of a Showgirl - The Encore 专辑封面' },
  { title: 'Oh yeah?', subtitle: 'Steve Lacy', src: '/albums/recent/Oh yeah.webp', alt: 'Oh yeah? 专辑封面' },
  { title: 'PRIMA', subtitle: 'ADÉLA', src: '/albums/recent/PRIMA.webp', alt: 'PRIMA 专辑封面' },
]

// 专辑墙按每行 10 张排列；01—10 为第一行，11—20 为第二行，以此类推。
const albumWall = [
  { id: "01", title: "The Secret of Us - Gracie Abrams", src: "/albums/wall/01 - The Secret of Us.webp" },
  { id: "02", title: "The Secret of Us - Gracie Abrams", src: "/albums/wall/02 - Fancy That.webp" },
  { id: "03", title: "DeBÍ TiRAR MáS FOToS - Bad Bunny", src: "/albums/wall/03 - DtMF.webp" },
  { id: "04", title: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO? - Billie Eilish", src: "/albums/wall/04 - WHEN WE ALL FALL ASLEEP.webp" },
  { id: "05", title: "Did you know that there's a tunnel under Ocean Blvd - Lana Del Rey", src: "/albums/wall/05 - Did You Know That There's a Tunnel Under Ocean Blvd.webp" },
  { id: "06", title: "evermore - Taylor Swift", src: "/albums/wall/06 - evermore.webp" },
  { id: "07", title: "ARIRANG - BTS", src: "/albums/wall/07 - ARIRANG.webp" },
  { id: "08", title: "After Hours - The Weeknd", src: "/albums/wall/08 - After Hours.webp" },
  { id: "09", title: "The Fame Monster - Lady Gaga", src: "/albums/wall/09 - The Fame Monster.webp" },
  { id: "10", title: "MASSEDUCTION - St. Vincent", src: "/albums/wall/10 - MASSEDUCTION.webp" },
  { id: "11", title: "GUTS - Olivia Rodrigo", src: "/albums/wall/11 - GUTS.webp" },
  { id: "12", title: "25 - Adele", src: "/albums/wall/12 - 25.webp" },
  { id: "13", title: "Man's Best Friend - Sabrina Carpenter", src: "/albums/wall/13 - Man’s Best Friend.webp" },
  { id: "14", title: "West End Girl - Lily Allen", src: "/albums/wall/14 - West End Girl.webp" },
  { id: "15", title: "Imaginal Disk - Magdalena Bay", src: "/albums/wall/15 - Imaginal Disk.webp" },
  { id: "16", title: "Your Name. - RADWIMPS", src: "/albums/wall/16 - Your Name..webp" },
  { id: "17", title: "Sweetener - Ariana Grande", src: "/albums/wall/17 - Sweetener.webp" },
  { id: "18", title: "Bloom - Troye Sivan", src: "/albums/wall/18 - Bloom.webp" },
  { id: "19", title: "Midnights - Taylor Swift", src: "/albums/wall/19 - Midnights.webp" },
  { id: "20", title: "陪我歌唱(苏打绿版) - 苏打绿", src: "/albums/wall/20 - 陪我歌唱(苏打绿版).webp" },
  { id: "21", title: "Bewitched - Laufey", src: "/albums/wall/21 - Bewitched.webp" },
  { id: "22", title: "My Beautiful Dark Twisted Fantasy - Kanye West", src: "/albums/wall/22 - My Beautiful Dark Twisted Fantasy.webp" },
  { id: "23", title: "E•MO•TION - Carly Rae Jepsen", src: "/albums/wall/23 - Emotion.webp" },
  { id: "24", title: "Golden Hour - Kacey Musgraves", src: "/albums/wall/24 - Golden Hour.webp" },
  { id: "25", title: "Blonde - Frank Ocean", src: "/albums/wall/25 - Blonde.webp" },
  { id: "26", title: "HIT ME HARD AND SOFT - Billie Eilish", src: "/albums/wall/26 - HIT ME HARD AND SOFT.webp" },
  { id: "27", title: "Norman Fucking Rockwell! - Lana Del Rey", src: "/albums/wall/27 - Norman Fucking Rockwell!.webp" },
  { id: "28", title: "Lemonade - Beyoncé", src: "/albums/wall/28 - Lemonade.webp" },
  { id: "29", title: "SOUR - Olivia Rodrigo", src: "/albums/wall/29 - SOUR.webp" },
  { id: "30", title: "Scarlet - Doja Cat", src: "/albums/wall/30 - Scarlet.webp" },
  { id: "31", title: "Music, Fashion, Film - Charli xcx", src: "/albums/wall/31 - Music, Fashion, Film.webp" },
  { id: "32", title: "Hounds of Love - Kate Bush", src: "/albums/wall/32 - Hounds of Love.webp" },
  { id: "33", title: "SOS - SZA", src: "/albums/wall/33 - SOS.webp" },
  { id: "34", title: "BRAT - Charli xcx", src: "/albums/wall/34 - BRAT.webp" },
  { id: "35", title: "1989 - Taylor Swift", src: "/albums/wall/35 - 1989.webp" },
  { id: "36", title: "eternal sunshine - Ariana Grande", src: "/albums/wall/36 - eternal sunshine.webp" },
  { id: "37", title: "MAYHEM - Lady Gaga", src: "/albums/wall/37 - MAYHEM.webp" },
  { id: "38", title: "Blue - Joni Mitchell", src: "/albums/wall/38 - Blue.webp" },
  { id: "39", title: "Interstellar - Hans Zimmer", src: "/albums/wall/39 - Interstellar.webp" },
  { id: "40", title: "EUSEXUA - FKA twigs", src: "/albums/wall/40 - EUSEXUA.webp" },
  { id: "41", title: "Speak Now (Taylor's Version) - Taylor Swift", src: "/albums/wall/41 - Speak Now.webp" },
  { id: "42", title: "Addison - Addison Rae", src: "/albums/wall/42 - Addison.webp" },
  { id: "43", title: "冀西南林路行 - 万能青年旅店", src: "/albums/wall/43 - 冀西南林路行.webp" },
  { id: "44", title: "The Dark Side of the Moon - Pink Floyd", src: "/albums/wall/44 - The Dark Side of the Moon.webp" },
  { id: "45", title: "RENAISSANCE - Beyoncé", src: "/albums/wall/45 - RENAISSANCE.webp" },
  { id: "46", title: "you seem pretty sad for a girl so in love - Olivia Rodrigo", src: "/albums/wall/46 - you seem pretty sad for a girl so in love.webp" },
  { id: "47", title: "纯妹妹 - 单依纯", src: "/albums/wall/47 - 纯妹妹.webp" },
  { id: "48", title: "Something Beautiful - Miley Cyrus", src: "/albums/wall/48 - Something Beautiful.webp" },
  { id: "49", title: "新的心跳 - G.E.M.邓紫棋", src: "/albums/wall/49 - 新的心跳.webp" },
  { id: "50", title: "Carrie & Lowell - Sufjan Stevens", src: "/albums/wall/50 - Carrie & Lowell.webp" },
  { id: "51", title: "CONFESSIONS II - Madonna", src: "/albums/wall/51 - CONFESSIONS II.webp" },
  { id: "52", title: "Elvis Presley - Elvis Presley", src: "/albums/wall/52 - Elvis Presley.webp" },
  { id: "53", title: "The Rise and Fall of a Midwest Princess - Chappell Roan", src: "/albums/wall/53 - The Rise and Fall of a Midwest Princess.webp" },
  { id: "54", title: "Melodrama - Lorde", src: "/albums/wall/54 - Melodrama.webp" },
  { id: "55", title: "LUX - ROSALÍA", src: "/albums/wall/55 - LUX.webp" },
  { id: "56", title: "Short n' Sweet - Sabrina Carpenter", src: "/albums/wall/56 - Short n' Sweet.webp" },
  { id: "57", title: "folklore - Taylor Swift", src: "/albums/wall/57 - folklore.webp" },
  { id: "58", title: "Lost Weekend - Phoebe Bridgers", src: "/albums/wall/58 - Lost Weekend.webp" },
  { id: "59", title: "The Miseducation of Lauryn Hill - Lauryn Hill", src: "/albums/wall/59 - The Miseducation of Lauren Hill.webp" },
  { id: "60", title: "THAT'S SHOWBIZ BABY! - JADE", src: "/albums/wall/60 - THAT's SHOWBBIZ BABY!.webp" },
  { id: "61", title: "Planet Her - Doja Cat", src: "/albums/wall/61 - Planet Her.webp" },
  { id: "62", title: "thank u, next - Ariana Grande", src: "/albums/wall/62 - thank u, next.webp" },
  { id: "63", title: "Dawn FM - The Weeknd", src: "/albums/wall/63 - Dawn FM.webp" },
  { id: "64", title: "无与伦比的美丽(苏打绿版) - 苏打绿", src: "/albums/wall/64 - 无与伦比的美丽(苏打绿版).webp" },
  { id: "65", title: "÷ - Ed Sheeran", src: "/albums/wall/65 - Divide.webp" },
  { id: "66", title: "The Art of Loving - Olivia Dean", src: "/albums/wall/66 - The Art of Loving.webp" },
  { id: "67", title: "Teenage Dream - Katy Perry", src: "/albums/wall/67 - Teenage Dream.webp" },
  { id: "68", title: "VILLAIN - 朱婧汐", src: "/albums/wall/68 - VILLAIN.webp" },
  { id: "69", title: "Virgin - Lorde", src: "/albums/wall/69 - Virgin.webp" },
  { id: "70", title: "Future Nostalgia - Dua Lipa", src: "/albums/wall/70 - future nostalgia.webp" },
  { id: "71", title: "Lover - Taylor Swift", src: "/albums/wall/71 - Lover.webp" },
  { id: "72", title: "最后的水族馆 - 裘德", src: "/albums/wall/72 - 最后的水族馆.webp" },
  { id: "73", title: "COWBOY CARTER - Beyoncé", src: "/albums/wall/73 - COWBOY CARTER.webp" },
  { id: "74", title: "ARTPOP - Lady Gaga", src: "/albums/wall/74 - Artpop.webp" },
  { id: "75", title: "Deeper Well - Kacey Musgraves", src: "/albums/wall/75 - Deeper Well.webp" },
  { id: "76", title: "The Complete Recordings - Robert Johnson", src: "/albums/wall/76 - The Complete Recordings.webp" },
  { id: "77", title: "To Pimp a Butterfly - Kendrick Lamar", src: "/albums/wall/77 - To Pimp a Butterfly.webp" },
  { id: "78", title: "The Tortured Poets Department - Taylor Swift", src: "/albums/wall/78 - The Tortured Poets Department.webp" },
  { id: "79", title: "THIS MUSIC MAY CONTAIN HOPE. - RAYE", src: "/albums/wall/79 - THIS MUSIC MAY CONTAIN HOPE..webp" },
  { id: "80", title: "Come Away with Me - Norah Jones", src: "/albums/wall/80 - Come Away with Me.webp" },
]

const albumImageCache = []
function preloadAlbumImages() {
  if (albumImageCache.length) return
  ;[...albumWall, ...recentAlbums].forEach(({ src }) => {
    const image = new Image()
    image.loading = 'eager'
    image.decoding = 'async'
    image.src = src
    albumImageCache.push(image)
  })
}

function CounterWheelNumber({ motionValue, number, height }) {
  const y = useTransform(motionValue, latest => {
    const currentDigit = latest % 10
    let offset = (10 + number - currentDigit) % 10
    if (offset > 5) offset -= 10
    return offset * height
  })

  return <motion.span className="viral-counter-number" style={{ y }}>{number}</motion.span>
}

function ViralIndexCounter({ value }) {
  const shouldReduceMotion = useReducedMotion()
  const animatedValue = useSpring(value, { stiffness: 190, damping: 24, mass: .72 })

  useEffect(() => {
    animatedValue.set(value)
  }, [animatedValue, value])

  const formattedValue = String(value).padStart(2, '0')
  if (shouldReduceMotion) return <span className="viral-index-counter">{formattedValue}</span>

  return <span className="viral-index-counter" aria-label={formattedValue}>
    <span aria-hidden="true">0</span>
    <span className="viral-counter-digit" aria-hidden="true">
      {Array.from({ length: 10 }, (_, number) => (
        <CounterWheelNumber motionValue={animatedValue} number={number} height={12} key={number} />
      ))}
    </span>
  </span>
}

function ViralCardMetrics({ metrics }) {
  const items = [
    { label: '播放量', value: metrics.views, Icon: Eye },
    { label: '点赞量', value: metrics.likes, Icon: Heart },
    { label: '收藏量与硬币量', value: metrics.saves + metrics.coins, Icon: Star },
    { label: '评论量与弹幕量', value: metrics.comments + metrics.danmakus, Icon: MessageCircle },
    { label: '转发量', value: metrics.shares, Icon: Share2 },
  ]

  return <span className="viral-card-metrics">
    {items.map(({ label, value, Icon }) => <span className="viral-card-metric" aria-label={`${label} ${metrics.available ? formatMetric(value) : '暂无数据'}`} title={label} key={label}>
      <Icon size={12} strokeWidth={1.7} aria-hidden="true" />
      <b>{metrics.available ? formatMetric(value) : '—'}</b>
    </span>)}
  </span>
}

function ViralWorksShowcase({ works }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [controlsState, setControlsState] = useState({ visible: false, floating: false, left: 0, top: 0 })
  const controlsRef = useRef(null)
  const stageRef = useRef(null)
  const controlsAnchorRef = useRef(null)
  const controlsElementRef = useRef(null)
  const activeWork = works[activeIndex]
  const interactionRate = activeWork.metrics.interactionRate

  useEffect(() => {
    let frame = 0

    const updateControls = () => {
      const stage = stageRef.current
      const anchor = controlsAnchorRef.current
      const controls = controlsElementRef.current
      const cards = stage ? [...stage.querySelectorAll('.swap-card')] : []
      if (!stage || !anchor || !controls || cards.length === 0) return

      const anchorRect = anchor.getBoundingClientRect()
      const cardRects = cards.map(card => card.getBoundingClientRect())
      const stackTop = Math.min(...cardRects.map(rect => rect.top))
      const stackBottom = Math.max(...cardRects.map(rect => rect.bottom))
      const stageStyles = window.getComputedStyle(stage)
      const fixedBottom = Number.parseFloat(stageStyles.getPropertyValue('--viral-controls-fixed-bottom')) || 24
      const controlsHeight = controls.offsetHeight
      const nativeViewportTop = anchorRect.top
      const nativeTop = nativeViewportTop + window.scrollY
      const nativeLeft = anchorRect.left + anchorRect.width / 2 + window.scrollX
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const fixedTop = viewportHeight - fixedBottom - controlsHeight
      const visibleStackHeight = Math.max(0, Math.min(stackBottom, viewportHeight) - Math.max(stackTop, 0))
      const visible = visibleStackHeight >= viewportHeight / 3
      const floating = nativeViewportTop > fixedTop

      setControlsState(previous => (
        previous.visible === visible
          && previous.floating === floating
          && Math.abs(previous.left - nativeLeft) < 0.5
          && Math.abs(previous.top - nativeTop) < 0.5
          ? previous
          : { visible, floating, left: nativeLeft, top: nativeTop }
      ))
    }

    const requestUpdate = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(updateControls)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    window.visualViewport?.addEventListener('resize', requestUpdate)
    const layoutObserver = new ResizeObserver(requestUpdate)
    if (stageRef.current) layoutObserver.observe(stageRef.current)
    if (controlsAnchorRef.current?.parentElement) layoutObserver.observe(controlsAnchorRef.current.parentElement)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      window.visualViewport?.removeEventListener('resize', requestUpdate)
      layoutObserver.disconnect()
    }
  }, [])

  const controlButtons = <div
    ref={controlsElementRef}
    className={`viral-controls-shell${controlsState.visible ? ' is-visible' : ''}${controlsState.floating ? ' is-floating' : ' is-native'}`}
    aria-label="控制爆款作品轮播"
    aria-hidden={!controlsState.visible}
    style={{
      '--viral-controls-left': `${controlsState.left}px`,
      '--viral-controls-native-top': `${controlsState.top}px`,
    }}
  >
    <div className="arrangement-controls viral-controls">
      <button type="button" className="arrangement-arrow" tabIndex={controlsState.visible ? 0 : -1} onClick={() => controlsRef.current?.previous()} aria-label="上一张爆款作品"><ChevronLeft/></button>
      <button type="button" className="arrangement-arrow" tabIndex={controlsState.visible ? 0 : -1} onClick={() => controlsRef.current?.next()} aria-label="下一张爆款作品"><ChevronRight/></button>
      <button type="button" className="arrangement-pause" onClick={() => setIsPaused(paused => {
        controlsRef.current?.setPaused(!paused)
        return !paused
      })} tabIndex={controlsState.visible ? 0 : -1} aria-label={isPaused ? '继续自动轮播' : '暂停自动轮播'}>
        {isPaused ? <Play size={17} fill="currentColor"/> : <Pause size={17} fill="currentColor"/>}
      </button>
    </div>
  </div>

  return <div className="viral-showcase">
    <div className="viral-copy">
      <div className="viral-detail-index">
        <ViralIndexCounter value={activeIndex + 1} />
        <i />
        <small>{String(works.length).padStart(2, '0')}</small>
      </div>
      <div className="viral-detail" key={activeWork.no}>
        <p className="viral-detail-label">{activeWork.label}</p>
        <h4>{(activeWork.titleLines || [activeWork.title]).map((line, index) => <React.Fragment key={line}>{index > 0 && <br />}{line}</React.Fragment>)}</h4>
        <p className="viral-detail-description">{activeWork.description}</p>
        <div className="viral-detail-meta">
          <span>核心标签</span><b>{activeWork.coreTags.join(' · ')}</b>
          <span>发布平台</span><b>{activeWork.metrics.platforms}</b>
        </div>
        <div className="viral-detail-stats">
          <div><strong>{activeWork.metrics.available ? <MetricValue value={activeWork.metrics.views} /> : '—'}</strong><span>播放量</span></div>
          <div><strong>{activeWork.metrics.available ? <MetricValue value={activeWork.metrics.engagement} /> : '—'}</strong><span>互动量</span></div>
          <div><strong>{interactionRate === null ? '—' : <>{interactionRate}<sup>%</sup></>}</strong><span>互动率</span></div>
        </div>
      </div>
    </div>

    <div ref={stageRef} className={`viral-card-stage${isPaused ? ' is-paused' : ''}`} aria-label="爆款作品轮播">
      <CardSwap
        width="clamp(340px,42vw,740px)"
        height="clamp(292px,calc(23.625vw + 101px),517px)"
        cardDistance={22}
        verticalDistance={28}
        delay={4800}
        pauseOnHover={false}
        controlsRef={controlsRef}
        skewAmount={4}
        easing="elastic"
        onActiveChange={setActiveIndex}
      >
        {works.map(item => <Card className="viral-art-card" key={item.no}>
          <div className="viral-art-card-head"><span>{item.no}</span><small>{item.label}</small></div>
          <img src={item.image} alt={item.imageAlt} />
          <div className="viral-art-card-foot"><strong>{item.line}</strong><ViralCardMetrics metrics={item.metrics} /></div>
        </Card>)}
      </CardSwap>
    </div>
    <span ref={controlsAnchorRef} className="viral-controls-anchor" aria-hidden="true" />
    {createPortal(controlButtons, document.body)}
  </div>
}

function ContentLineFolder({ item }) {
  const [open, setOpen] = useState(false)

  return <article className={`content-line-card${open ? ' is-open' : ''}`}>
    <div className="content-line-folder">
      <div className="folder-back folder-hover-target" aria-hidden="true" />
      <div className="folder-works">
        {item.works.map((work, index) => <a
          className={`folder-work folder-hover-target${work.image ? '' : ' folder-work-placeholder'}${work.wide ? ' is-wide' : ''}`}
          href={work.url || undefined}
          target={work.url ? '_blank' : undefined}
          rel={work.url ? 'noreferrer' : undefined}
          aria-disabled={!work.url}
          onClick={event => { if (!work.url) event.preventDefault() }}
          style={{ '--card-index': index, '--fan': index - (item.works.length - 1) / 2, '--edge': Math.abs(index - (item.works.length - 1) / 2) }}
          key={work.title}
        >
          {work.image ? <img src={work.image} alt="" loading="lazy" /> : <span className="folder-work-coming"><Music2 size={28}/><small>COMING SOON</small></span>}
          <span className="folder-work-title">{work.title}</span>
        </a>)}
      </div>
      <button className="folder-front folder-hover-target" type="button" aria-label={`${open ? '收起' : '展开'}${item.title}文件夹`} aria-expanded={open} onClick={event => {
        if (event.detail === 0 || window.matchMedia('(hover: none)').matches) setOpen(value => !value)
      }} onBlur={() => setOpen(false)}>
        <span className="folder-front-top"><span>{item.label}</span><span>{item.no} / 03</span></span>
        <span className="folder-front-bottom">
          <span className="folder-front-stat" aria-label={`观看量 ${formatMetric(item.views)}`}><Eye size={17} strokeWidth={1.6}/><span>{formatMetric(item.views)}</span></span>
          <span className="folder-front-stat" aria-label={`互动量 ${formatMetric(item.engagement)}`}><Heart size={17} strokeWidth={1.6}/><span>{formatMetric(item.engagement)}</span></span>
        </span>
      </button>
    </div>
    <div className="content-line-copy"><p>{item.label}</p><h3>{item.title}</h3><h4>{item.text}</h4></div>
  </article>
}

function App({ initialSocialData }) {
  const getPage = () => {
    const current = window.location.hash.replace('#', '')
    return nav.some(([id]) => id === current) || ['drum-layering', 'synth-design'].includes(current) ? current : 'home'
  }
  const [page, setPage] = useState(getPage)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasStartedMusic, setHasStartedMusic] = useState(false)
  const [isPlayerCompact, setIsPlayerCompact] = useState(false)
  const [isPlayerClosing, setIsPlayerClosing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [trendAnimationState, setTrendAnimationState] = useState('idle')
  const [audienceAnimationState, setAudienceAnimationState] = useState('idle')
  const [activeAudiencePlatform, setActiveAudiencePlatform] = useState('bilibili')
  const audioRef = useRef(null)
  const heroImagePreload = useRef(null)
  const heroNameRef = useRef(null)
  const trendDashboardRef = useRef(null)
  const audienceGridRef = useRef(null)
  const educationTimelineRef = useRef(null)
  const strengthTrendRevealRef = useEducationReveal('strengthTrend', page === 'strengths')
  const socialMatrixRevealRef = useEducationReveal('socialMatrix', page === 'social')
  const socialContentRevealRef = useEducationReveal('socialContent', page === 'social')
  const socialViralRevealRef = useEducationReveal('socialViral', page === 'social')
  const socialTrendRevealRef = useEducationReveal('socialTrend', page === 'social')
  const socialAudienceRevealRef = useEducationReveal('socialAudience', page === 'social')
  const initialScrollStateRef = useRef(null)

  if (initialScrollStateRef.current === null) {
    const navigation = performance.getEntriesByType('navigation')[0]
    if (navigation?.type === 'reload') {
      try {
        const saved = JSON.parse(sessionStorage.getItem(SCROLL_STATE_KEY))
        if (saved?.hash === window.location.hash) initialScrollStateRef.current = saved
      } catch {
        initialScrollStateRef.current = false
      }
    } else {
      initialScrollStateRef.current = false
    }
  }

  useLayoutEffect(() => {
    const saved = initialScrollStateRef.current
    if (!saved) return

    let firstFrame = 0
    let secondFrame = 0
    const restoreScroll = () => {
      window.scrollTo(0, saved.windowY || 0)
      const overview = document.querySelector('#works .works-overview')
      if (overview) overview.scrollTop = saved.worksOverviewY || 0
    }
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(restoreScroll)
    })
    window.addEventListener('load', restoreScroll, { once: true })

    return () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
      window.removeEventListener('load', restoreScroll)
    }
  }, [])

  useEffect(() => {
    const saveScroll = () => {
      const overview = document.querySelector('#works .works-overview')
      try {
        sessionStorage.setItem(SCROLL_STATE_KEY, JSON.stringify({
          hash: window.location.hash,
          windowY: window.scrollY,
          worksOverviewY: overview?.scrollTop || 0,
        }))
      } catch {
        // Browsing can continue normally when storage is unavailable.
      }
    }

    window.addEventListener('pagehide', saveScroll)
    window.addEventListener('beforeunload', saveScroll)
    return () => {
      window.removeEventListener('pagehide', saveScroll)
      window.removeEventListener('beforeunload', saveScroll)
    }
  }, [])

  useLayoutEffect(() => {
    if (page !== 'education') return
    const timeline = educationTimelineRef.current
    if (!timeline) return
    const dots = timeline.querySelectorAll('.edu-record .dot')
    if (dots.length !== 2) return
    const positionLine = () => {
      const timelineRect = timeline.getBoundingClientRect()
      const first = dots[0].getBoundingClientRect()
      const second = dots[1].getBoundingClientRect()
      timeline.style.setProperty('--timeline-line-x', `${first.left + first.width / 2 - timelineRect.left}px`)
      timeline.style.setProperty('--timeline-line-top', `${first.top + first.height / 2 - timelineRect.top}px`)
      timeline.style.setProperty('--timeline-line-height', `${second.top + second.height / 2 - first.top - first.height / 2}px`)
    }
    positionLine()
    const observer = new ResizeObserver(positionLine)
    observer.observe(timeline)
    dots.forEach(dot => observer.observe(dot.closest('.edu-record')))
    window.addEventListener('resize', positionLine)
    document.fonts.ready.then(positionLine)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', positionLine)
    }
  }, [page])
  useEffect(() => {
    const image = new Image()
    image.src = '/portrait.webp'
    image.decode?.().catch(() => {})
    heroImagePreload.current = image
    preloadAlbumImages()
  }, [])
  useEffect(() => {
    if (page === 'skills') {
      preloadSkillImages()
      return
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preloadSkillImages, { timeout: 2500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(preloadSkillImages, 1500)
    return () => window.clearTimeout(id)
  }, [page])
  useEffect(() => {
    if (!window.location.hash) history.replaceState(null, '', '#home')
    const onHashChange = () => {
      setPage(getPage())
      setMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  useLayoutEffect(() => {
    if (page !== 'works') return
    let shouldReturnToArrangement = false
    try {
      shouldReturnToArrangement = ['blank-space', 'three-sixty'].includes(sessionStorage.getItem(RETURN_TO_ARRANGEMENT_KEY))
      if (shouldReturnToArrangement) sessionStorage.removeItem(RETURN_TO_ARRANGEMENT_KEY)
    } catch {
      // Navigation still works when session storage is unavailable.
    }
    if (!shouldReturnToArrangement) return
    const frame = window.requestAnimationFrame(() => {
      document.querySelector('.arrangement-details')?.scrollIntoView({ block: 'start', behavior: 'instant' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [page])
  useEffect(() => {
    if (page === 'drum-layering' || page === 'synth-design') setIsPlaying(false)
  }, [page])
  useEffect(() => {
    document.body.classList.toggle('home-page', page === 'home')
    document.documentElement.classList.toggle('works-page', page === 'works')
    document.body.classList.toggle('works-page', page === 'works')
    document.documentElement.classList.toggle('drum-layering-page', page === 'drum-layering')
    document.body.classList.toggle('drum-layering-page', page === 'drum-layering')
    document.documentElement.classList.toggle('synth-design-page', page === 'synth-design')
    document.body.classList.toggle('synth-design-page', page === 'synth-design')
    document.documentElement.classList.toggle('contact-page', page === 'contact')
    document.body.classList.toggle('contact-page', page === 'contact')
    document.documentElement.classList.toggle('education-page', page === 'education')
    document.body.classList.toggle('education-page', page === 'education')
    document.documentElement.classList.toggle('skills-page', page === 'skills')
    document.body.classList.toggle('skills-page', page === 'skills')
    document.documentElement.classList.toggle('social-page', page === 'social')
    document.body.classList.toggle('social-page', page === 'social')
    return () => {
      document.body.classList.remove('home-page')
      document.documentElement.classList.remove('works-page')
      document.body.classList.remove('works-page')
      document.documentElement.classList.remove('drum-layering-page')
      document.body.classList.remove('drum-layering-page')
      document.documentElement.classList.remove('synth-design-page')
      document.body.classList.remove('synth-design-page')
      document.documentElement.classList.remove('contact-page')
      document.body.classList.remove('contact-page')
      document.documentElement.classList.remove('education-page')
      document.body.classList.remove('education-page')
      document.documentElement.classList.remove('skills-page')
      document.body.classList.remove('skills-page')
      document.documentElement.classList.remove('social-page')
      document.body.classList.remove('social-page')
    }
  }, [page])
  useEffect(() => {
    if (page !== 'social') return
    const root = document.documentElement
    const body = document.body
    const updateSocialEdge = () => {
      const isAtTop = window.scrollY <= 1
      root.classList.toggle('social-at-top', isAtTop)
      body.classList.toggle('social-at-top', isAtTop)
    }
    updateSocialEdge()
    window.addEventListener('scroll', updateSocialEdge, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateSocialEdge)
      root.classList.remove('social-at-top')
      body.classList.remove('social-at-top')
    }
  }, [page])
  useEffect(() => {
    if (page !== 'education') return
    const root = document.documentElement
    const body = document.body
    const updateEducationEdge = () => {
      const isAtTop = window.scrollY <= 1
      root.classList.toggle('education-at-top', isAtTop)
      body.classList.toggle('education-at-top', isAtTop)
    }
    updateEducationEdge()
    window.addEventListener('scroll', updateEducationEdge, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateEducationEdge)
      root.classList.remove('education-at-top')
      body.classList.remove('education-at-top')
    }
  }, [page])
  useEffect(() => {
    if (page !== 'works') return
    const nav = document.querySelector('.nav-wrap.dark-page')
    const works = document.querySelector('#works')
    const overview = document.querySelector('#works .works-overview')
    const pageScroller = document.scrollingElement
    if (!nav || !works || !overview || !pageScroller) return

    const wheelDelta = event => event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1)

    const onOverviewWheel = event => {
      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      const delta = wheelDelta(event)
      const pageTop = pageScroller.scrollTop
      if (delta < 0 && pageTop > 0) {
        event.preventDefault()
        pageScroller.scrollTop = Math.max(0, pageTop + delta)
        if (pageTop + delta < 0) overview.scrollTop += pageTop + delta
        return
      }
      const max = overview.scrollHeight - overview.clientHeight
      if (max <= 0) return
      const top = overview.scrollTop
      const next = Math.max(0, Math.min(max, top + delta))
      const remainder = delta - (next - top)
      if (remainder === 0) return
      event.preventDefault()
      overview.scrollTop = next
      if (remainder) pageScroller.scrollTop += remainder
    }

    const onOuterWheel = event => {
      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX) || overview.contains(event.target)) return
      const delta = wheelDelta(event)
      const pageTop = pageScroller.scrollTop
      if (delta < 0 && pageTop > 0) {
        if (pageTop + delta >= 0) return
        event.preventDefault()
        pageScroller.scrollTop = 0
        overview.scrollTop += pageTop + delta
        return
      }
      if (pageTop > 0) return
      const top = overview.scrollTop
      const max = overview.scrollHeight - overview.clientHeight
      const next = Math.max(0, Math.min(max, top + delta))
      if (next === top) return
      event.preventDefault()
      overview.scrollTop = next
      const remainder = delta - (next - top)
      if (remainder > 0) pageScroller.scrollTop += remainder
    }

    overview.addEventListener('wheel', onOverviewWheel, { passive: false })
    works.addEventListener('wheel', onOuterWheel, { passive: false })
    nav.addEventListener('wheel', onOuterWheel, { passive: false })
    return () => {
      overview.removeEventListener('wheel', onOverviewWheel)
      works.removeEventListener('wheel', onOuterWheel)
      nav.removeEventListener('wheel', onOuterWheel)
    }
  }, [page])
  useEffect(() => {
    if (page !== 'social' || trendAnimationState !== 'idle') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTrendAnimationState('complete')
      return
    }
    const dashboard = trendDashboardRef.current
    if (!dashboard) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTrendAnimationState('playing')
        observer.disconnect()
      }
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' })
    observer.observe(dashboard)
    return () => observer.disconnect()
  }, [page, trendAnimationState])
  useEffect(() => {
    if (trendAnimationState !== 'playing') return
    const timer = window.setTimeout(() => setTrendAnimationState('complete'), 1380)
    return () => window.clearTimeout(timer)
  }, [trendAnimationState])
  useEffect(() => {
    if (page !== 'social' || audienceAnimationState !== 'idle') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAudienceAnimationState('complete')
      return
    }
    const grid = audienceGridRef.current
    if (!grid) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setAudienceAnimationState('playing')
        observer.disconnect()
      }
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' })
    observer.observe(grid)
    return () => observer.disconnect()
  }, [page, audienceAnimationState])
  useEffect(() => {
    if (audienceAnimationState !== 'playing') return
    const timer = window.setTimeout(() => setAudienceAnimationState('complete'), 1400)
    return () => window.clearTimeout(timer)
  }, [audienceAnimationState])
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = event => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [currentTrackIndex, isPlaying])

  useEffect(() => {
    const onKeyDown = event => {
      if (page === 'drum-layering' || page === 'synth-design' || event.code !== 'Space' || event.repeat || !hasStartedMusic || isPlayerClosing) return
      const target = event.target
      if (target instanceof HTMLElement && (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target.tagName)
      )) return
      event.preventDefault()
      setIsPlaying(playing => !playing)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [page, hasStartedMusic, isPlayerClosing])

  const toggleTrack = index => {
    setIsPlayerClosing(false)
    setHasStartedMusic(true)
    if (index === currentTrackIndex) {
      setIsPlaying(playing => !playing)
      return
    }
    const audio = audioRef.current
    const nextTrack = musicTracks[index]
    const hasLoadedNextTrack = audio?.getAttribute('src') === nextTrack.src &&
      audio.readyState >= HTMLMediaElement.HAVE_METADATA && Number.isFinite(audio.duration)
    setCurrentTrackIndex(index)
    setCurrentTime(0)
    setDuration(hasLoadedNextTrack ? audio.duration : 0)
    setIsPlaying(true)
  }

  const playNext = () => {
    setCurrentTrackIndex(index => ((index ?? -1) + 1) % musicTracks.length)
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(true)
  }

  const seekTo = event => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const nextTime = Number(event.target.value)
    audio.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const closePlayer = () => {
    setIsPlayerClosing(true)
  }

  useEffect(() => {
    if (!isPlayerClosing) return
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 340
    const timer = window.setTimeout(() => {
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      setIsPlaying(false)
      setCurrentTime(0)
      setHasStartedMusic(false)
      setIsPlayerClosing(false)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [isPlayerClosing])

  const currentTrack = musicTracks[currentTrackIndex ?? 0]
  const socialData = initialSocialData || fallbackSocialData
  const totalSocial = socialData.total || fallbackSocialData.total
  const followerChart = buildFollowerChart(socialData.follower_growth?.total)
  const followerGrowthLabel = followerChart?.growthRate == null
    ? '—'
    : `${followerChart.growthRate > 0 ? '+' : ''}${followerChart.growthRate.toFixed(1)}%`
  const viewsChart = buildFollowerChart(socialData.follower_growth?.total, 'views', VIEWS_CHART_TICKS)
  const viewsGrowthLabel = viewsChart?.growthRate == null
    ? '—'
    : `${viewsChart.growthRate > 0 ? '+' : ''}${viewsChart.growthRate.toFixed(1)}%`
  const viralRateValue = socialData.viral_rate?.rate
  const viralRate = Number(viralRateValue)
  const hasViralRate = viralRateValue != null && Number.isFinite(viralRate)
  const viralRateLabel = hasViralRate
    ? viralRate.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
    : '—'
  const strengthSocial = initialSocialData?.total || {}
  const currentStrengths = getStrengths(strengthSocial)
  const currentStrengthStories = strengthStories.map(story => {
    if (!['02', '04'].includes(story.no)) return story
    const values = {
      'AUDIENCE RESPONSE': `${formatMetric(initialSocialData?.remake?.views)}播放 · ${formatMetric(initialSocialData?.remake?.engagement)}互动`,
      'CONTENT OUTPUT': `${formatMetric(initialSocialData?.bilibili?.video_count)}期作品 · ${formatMetric(strengthSocial.views)}播放`,
      'AUDIENCE ENGAGEMENT': `${formatMetric(strengthSocial.fans)}粉丝 · ${formatMetric(strengthSocial.engagement)}互动`,
    }
    return {
      ...story,
      points: story.points.map(point => values[point.label] == null ? point : { ...point, value: values[point.label] }),
    }
  })
  const platformCards = makePlatformCards(socialData)
  const currentSocialContentPillars = socialContentPillars.map(item => {
    if (!item.dataKey) return item
    const series = socialData[item.dataKey] || fallbackSocialData[item.dataKey]
    return {
      ...item,
      views: toMetricNumber(series.views),
      engagement: toMetricNumber(series.engagement),
    }
  })
  const viralWorksData = socialData.viral_works || {}
  const currentSocialViralWorks = socialViralWorks.map(item => {
    const metrics = viralWorksData[item.dataKey] || {}
    const available = metrics.views != null && metrics.engagement != null
    const views = toMetricNumber(metrics.views)
    const engagement = toMetricNumber(metrics.engagement)
    const suppliedRate = Number(metrics.engagement_rate)
    const platforms = Object.keys(metrics.platforms || {})
      .map(key => socialPlatformNames[key] || key)
      .join(' · ')
    return {
      ...item,
      metrics: {
        available,
        views,
        engagement,
        likes: toMetricNumber(metrics.likes),
        saves: toMetricNumber(metrics.saves),
        coins: toMetricNumber(metrics.coins),
        comments: toMetricNumber(metrics.comments),
        danmakus: toMetricNumber(metrics.danmakus),
        shares: toMetricNumber(metrics.shares),
        interactionRate: Number.isFinite(suppliedRate)
          ? suppliedRate.toFixed(2)
          : views ? (engagement / views * 100).toFixed(2) : null,
        platforms: platforms || '暂无匹配数据',
      },
    }
  })
  const engagementRate = toMetricNumber(totalSocial.views)
    ? (toMetricNumber(totalSocial.engagement) / toMetricNumber(totalSocial.views) * 100).toFixed(2)
    : '0.00'
  const interactionGroups = [
    ['点赞 / 投币', toMetricNumber(totalSocial.likes) + toMetricNumber(totalSocial.coins)],
    ['收藏', toMetricNumber(totalSocial.saves)],
    ['评论 / 弹幕', toMetricNumber(totalSocial.comments) + toMetricNumber(totalSocial.danmakus)],
    ['转发', toMetricNumber(totalSocial.shares)],
  ]
  const interactionTotal = interactionGroups.reduce((sum, [, value]) => sum + value, 0)
  const interactionBreakdown = interactionGroups.map(([label, value]) => [
    label,
    formatMetric(value),
    `${interactionTotal ? Math.round(value / interactionTotal * 100) : 0}%`,
  ])
  const interactionStops = interactionGroups.reduce((stops, [, value]) => {
    stops.push((stops.at(-1) || 0) + (interactionTotal ? value / interactionTotal * 100 : 0))
    return stops
  }, [])
  const activeAudience = audienceProfiles[activeAudiencePlatform]
  const genderStops = activeAudience.gender.reduce((stops, [, value]) => {
    stops.push((stops.at(-1) || 0) + Number.parseFloat(value))
    return stops
  }, [])
  const maxAudienceAge = Math.max(...activeAudience.age.map(([, value]) => Number.parseFloat(value)), 1)
  const maxAudienceRegion = Math.max(...activeAudience.regions.map(([, value]) => Number.parseFloat(value)), 1)

  return <>
    {!['drum-layering', 'synth-design'].includes(page) && <header className={`${page === 'works' ? 'nav-wrap dark-page' : 'nav-wrap'}${menuOpen ? ' menu-open' : ''}`}>
      <button className="menu-toggle" type="button" aria-label={menuOpen ? '收起导航菜单' : '展开导航菜单'} aria-expanded={menuOpen} aria-controls="portrait-navigation" onClick={() => setMenuOpen(open => !open)}>
        {menuOpen ? <X size={21} strokeWidth={1.7}/> : <Menu size={22} strokeWidth={1.7}/>}
      </button>
      <a className="brand" href="#home" aria-label="August · 返回首页">
        <img className="brand-logo" src={page === 'works' ? '/logo-dark.png' : '/logo.png'} alt="" aria-hidden="true" />
        <span className="brand-word">August</span>
      </a>
      <nav aria-label="主导航">
        {nav.filter(([id]) => id !== 'contact').map(([id, label]) => <a className={page === id ? 'active' : ''} key={id} href={`#${id}`} aria-current={page === id ? 'page' : undefined}>{label}</a>)}
      </nav>
      <a className={`contact-nav ${page === 'contact' ? 'active' : ''}`} href="#contact" aria-current={page === 'contact' ? 'page' : undefined}>联系我</a>
      <button className="menu-scrim" type="button" aria-label="收起导航菜单" aria-hidden={!menuOpen} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} />
      <nav className="portrait-nav" id="portrait-navigation" aria-label="竖屏导航" aria-hidden={!menuOpen}>
        {nav.filter(([id]) => id !== 'contact').map(([id, label]) => <a className={page === id ? 'active' : ''} key={id} href={`#${id}`} tabIndex={menuOpen ? 0 : -1} aria-current={page === id ? 'page' : undefined}>{label}</a>)}
      </nav>
    </header>}

    <main className={`page-stage ${page === 'home' ? 'home-stage' : ''}${page === 'drum-layering' ? ' drum-layering-stage' : ''}${page === 'synth-design' ? ' synth-design-stage' : ''}`} key={page}>
      {page === 'home' && <section className="hero">
        <DitherCursor />
        <div className="hero-copy">
          <div className="eyebrow"><span></span> MUSIC &amp; CREATIVITY · 2026</div>
          <h1>我是<strong ref={heroNameRef} className="hero-name">
            <VariableProximity
              label="裴宇航"
              fromFontVariationSettings="'wght' 600"
              toFontVariationSettings="'wght' 900"
              containerRef={heroNameRef}
              radius={180}
              falloff="gaussian"
            />
          </strong></h1>
          <p className="hero-profile">来自浙江大学计算机学院<br/>专业第一 <i>&amp;</i> 国家奖学金</p>
          <p className="hero-role">制作编曲 <i>/</i> AIGC 音乐 <i>/</i> 音乐内容运营</p>
          <div className="hero-actions">
            <a className="primary" href="#works">查看作品 <ArrowUpRight size={18}/></a>
            <a className="text-link" href="/resume/制作岗个人简历Ver1.docx" download>下载简历 <ArrowDown size={16}/></a>
          </div>
        </div>
        <TiltedCard className="hero-photo" rotateAmplitude={1} scaleOnHover={1.01} showTooltip={false}>
          <div className="photo-label">AUGUST<br/>PEI</div>
          <img src="/portrait.webp" width="1200" height="1800" decoding="async" fetchPriority="high" alt="裴宇航个人照片" />
        </TiltedCard>
      </section>}

      {page === 'strengths' && <section className="section intro" id="strengths">
        <div className="strength-overview">
          <div className="strength-overview-heading">
            <SectionHead kicker="WHY ME" title={<>个人优势<br/>技术理性×音乐感性</>} />
            <p className="section-lead">技术背景让我理解工具与工作流，编曲与 AIGC 音乐实践让我理解声音与审美，内容经验则让我知道如何让好作品被看见。</p>
          </div>
          <div className="strength-grid">
            {currentStrengths.map((item, i) => <TiltedCard
              className="strength-tilt"
              key={item.no}
              rotateAmplitude={3}
              scaleOnHover={1.03}
              showTooltip={false}
            >
              <article className={`strength-card c${i+1}`}>
                <div className="card-top"><span>{item.no}</span><ArrowUpRight size={20}/></div>
                <div className="card-copy"><h3><span className="title-text">{item.title}</span></h3><p>{item.text}</p></div>
                <small>{item.tag}</small>
              </article>
            </TiltedCard>)}
          </div>
          <div className="metrics">
            <div><strong>3.98<sup>/4.0</sup></strong><span>本科 GPA</span></div>
            <div><strong>01<sup>/85</sup></strong><span>专业排名</span></div>
            <div><strong><MetricValue value={strengthSocial.views} /></strong><span>全网内容播放</span></div>
            <div><strong><MetricValue value={strengthSocial.fans} /></strong><span>全网粉丝量</span></div>
          </div>
        </div>
        <div className="strength-details">
          {/* 暂时隐藏过渡标题；需要时可取消注释恢复。 */}
          {/*
          <div className="strength-details-intro">
            <p className="mini">A CLOSER LOOK</p>
            <h3>继续向下，<br/>把四个优势展开来看。</h3>
            <span>SCROLL TO EXPLORE ↓</span>
          </div>
          */}
          {currentStrengthStories.map(story => <StrengthStory key={story.no} {...story} educationReveal />)}
          <article className="trend-story strength-story has-footer" ref={strengthTrendRevealRef}>
            <div className="trend-inner">
              <header className="story-header">
                <span className="story-no">05</span>
                <p className="mini">POP CULTURE &amp; TREND RESEARCH</p>
              </header>
              <div className="trend-heading">
                <h3>持续追踪热点，<br/>读懂流行的变化。</h3>
                <p>自 2022 年 10 月起持续研究欧美流行音乐与市场变化，把榜单、乐评、社交热度和歌曲制作放在同一张观察地图里。</p>
              </div>
              <div className="story-points">
                <div className="story-point"><span>CHARTS & REVIEWS</span><strong>榜单与口碑</strong><p>追踪 Billboard Hot 100、Spotify Global 榜单，关注 AOTY、Metacritic 等乐评聚合站，观察作品的市场表现与专业评价。</p></div>
                <div className="story-point"><span>SONIC EVOLUTION</span><strong>制作趋势分析</strong><p>观察曲风演变、编曲范式与声音审美变化，将市场信号转化为选曲和制作参考。</p></div>
                <div className="story-point"><span>CASE STUDIES</span><strong>发行案例研究</strong><p>以 Taylor Swift《Midnights》、Charli xcx《BRAT》等发行项目为例，理解音乐、视觉与平台传播如何协同。</p></div>
              </div>
            </div>
            <footer className="page-section-footer strength-trend-footer"><span>© 2026 AUGUST PEI</span><a className="contact-back-home" href="#home">BACK TO HOME <span aria-hidden="true">↑</span></a></footer>
          </article>
        </div>
      </section>}

      {page === 'education' && <section className="section education" id="education">
        <div className="education-overview">
          <div className="education-overview-heading">
            <SectionHead kicker="EDUCATION" title={<>教育经历<br/>塑造我的来时路</>} />
            <p className="section-lead">浙江大学计算机本硕的历练，赋予我快速学习的能力，和对AI技术的扎实理解与熟练经验。理性的技术积淀滋养感性创作，让我在理性与感性之间探寻属于当代的音乐表达。</p>
          </div>
          <div className="edu-grid">
            <div className="edu-timeline" ref={educationTimelineRef}>
              <div className="edu-item active">
                <figure className="edu-campus-image"><img src="/education/ZJU1.png" alt="浙江大学校园意象插画" /></figure>
                <div className="edu-record"><div className="dot"></div><div className="date">2024.09 — 至今</div><div className="edu-record-copy"><h3>浙江大学</h3><p>计算机科学与技术 · 硕士（推免）</p><small className="edu-note">研究方向为AIGC、多模态大模型、Diffusion、图像生成与图像编辑</small></div></div>
              </div>
              <div className="edu-item">
                <figure className="edu-campus-image"><img src="/education/ZJU2.png" alt="浙江大学教学楼意象插画" /></figure>
                <div className="edu-record"><div className="dot"></div><div className="date">2020.09 — 2024.06</div><div className="edu-record-copy"><h3>浙江大学</h3><p>软件工程 · 学士</p><small className="edu-note">展现了杰出的学习能力，奠定了扎实的计算机基础</small></div></div>
              </div>
            </div>
            <div className="honor-panel">
              <div className="honor-summary">
                <div className="honor-icon"><Award size={27}/></div>
                <p className="mini">ACADEMIC RECORD</p>
                <h3>学业成绩<br/>与奖项荣誉</h3>
              </div>
              <ul>
                <li><span>GPA</span><b>3.98 / 4.0</b></li>
                <li><span>专业排名</span><b>1 / 85</b></li>
                <li><span>国家奖学金</span><b>2 次</b></li>
                <li><span>一等奖学金</span><b>前 3%</b></li>
                <li><span>毕业荣誉</span><b>浙江省优秀毕业生</b></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="education-details">
          {/* <div className="strength-details-intro education-details-intro">
            <p className="mini">BEYOND THE TIMELINE</p>
            <h3>继续向下，<br/>看见成绩背后的能力。</h3>
            <span>SCROLL TO EXPLORE ↓</span>
          </div> */}
          {educationStories.map(story => story.no === '01'
            ? <EducationLearningStory key={story.no} {...story} />
            : story.no === '02'
              ? <EducationAIStory key={story.no} {...story} />
              : <StrengthStory key={story.no} {...story} educationReveal />)}
        </div>
      </section>}

      {page === 'works' && <section className="section works" id="works">
        <div className="works-overview">
          <div className="works-overview-header">
            <SectionHead kicker="SELECTED WORKS" title="音乐作品" light />
            <p className="works-intro">从经典热单的精确复刻，到 AIGC 辅助的原创探索。<br/>从 Remake 到 Original，持续探索制作的边界。</p>
          </div>
          <div className="work-list">
            {musicTracks.map((track, index) => <Work
              key={track.title}
              no={`0${index + 1}`}
              {...track}
              active={currentTrackIndex === index}
              isPlaying={isPlaying}
              onToggle={() => toggleTrack(index)}
            />)}
            <Work
              no="04"
              title="AIGC ORIGINAL PROJECTS"
              artist="AUGUST × SUNO"
              tags={['Suno', 'Prompt Design', 'AI Arrangement', 'DAW Rebuild', 'Sound Selection']}
              color="blue"
              placeholder
            />
          </div>
          <div className="works-note"><Sparkles size={16}/> AIGC 原创音乐企划持续制作中，完成后将在这里开放试听。</div>
        </div>
        <ArrangementDetails />
      </section>}

      {page === 'drum-layering' && <DrumLayeringPage />}
      {page === 'synth-design' && <SynthDesignPage />}

      {page === 'social' && <section className="section social" id="social">
        <section className="social-panel social-hero-panel">
          <div className="social-panel-inner social-hero-inner">
            <div className="social-hero-copy">
              <SectionHead kicker="SOCIAL PRESENCE" title={<>把热爱做成内容<br/>把内容带向远方</>} />
              <div className="social-profile-head">
                <img src={socialAvatar} alt="August 的账号头像" />
                <div className="social-profile-copy">
                  <h2>August</h2>
                  <div className="social-profile-tags">
                    <b>My Tag:</b>
                    <div className="social-tag-viewport">
                      <div className="social-tag-track">
                        {[false, true].map(duplicate => <div className="social-tag-group" aria-hidden={duplicate || undefined} key={duplicate ? 'duplicate' : 'primary'}>
                          {socialProfileTags.map(tag => <span key={tag}>{tag}</span>)}
                        </div>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="social-hero-intro">从 0 到 1 独立运营欧美流行音乐相关内容，完成选题策划、音乐制作、视觉设计、视频剪辑与多平台分发，让创作与传播形成闭环。</p>
            <div className="social-hero-metrics">
              <div><strong><MetricValue value={totalSocial.fans} /></strong><span>全网粉丝</span></div>
              <div><strong><MetricValue value={totalSocial.views} /></strong><span>全网总浏览量</span></div>
              <div><strong><MetricValue value={totalSocial.engagement} /></strong><span>总互动量</span></div>
              <div><strong>{engagementRate}<sup>%</sup></strong><span>平均互动率</span></div>
            </div>
            <div className="social-channel-marquee" aria-label="August 的社交媒体账号">
              <div className="social-channel-track">
                {[...socialChannels, ...socialChannels].map((channel, index) => <TiltedCard
                  className="social-channel-tilt"
                  rotateAmplitude={3.8}
                  scaleOnHover={1.04}
                  showTooltip={false}
                  key={`${channel.name}-${index}`}
                >
                  <a className="social-channel-card" href={channel.url} target="_blank" rel="noreferrer" aria-hidden={index >= socialChannels.length} tabIndex={index >= socialChannels.length ? -1 : undefined}>
                    <img src={channel.icon} alt="" />
                    <div><span>{channel.name}</span><strong>{channel.id}</strong></div>
                    <small>访问账号 <ArrowUpRight size={14}/></small>
                  </a>
                </TiltedCard>)}
              </div>
            </div>
          </div>
        </section>

        <section className="social-panel social-matrix-panel" id="platform-matrix" ref={socialMatrixRevealRef}>
          <div className="social-panel-inner">
            <div className="social-section-heading">
              <header className="story-header"><span className="story-no">01</span><p className="mini">PLATFORM MATRIX</p></header>
              <div className="story-heading"><h3>平台矩阵</h3><p>围绕同一内容核心，针对不同平台的用户习惯与分发机制完成适配。数据来自各平台最新一次统计。</p></div>
            </div>
            <div className="platform-grid">
              {platformCards.map(p => <article className={`platform${p.featured ? ' featured' : ''}${p.neutral ? ' neutral' : ''}`} key={p.name}>
                <div className="platform-head">
                  <span className="platform-logo-group" aria-hidden="true">
                    {p.icons.map((icon, index) => <img src={icon} alt="" key={`${p.name}-${index}`} />)}
                  </span>
                  <ArrowUpRight size={20} aria-hidden="true" />
                </div>
                <h3>{p.titleLead ? <><span>{p.titleLead}</span><span className="platform-title-tail">{p.titleTail}</span></> : p.name}</h3>
                <div className="platform-stats">{p.stats.map(([value, label]) => <div key={label}><b>{formatMetric(value)}</b><span>{label}</span></div>)}</div>
              </article>)}
            </div>
          </div>
        </section>

        <section className="social-panel social-content-panel" ref={socialContentRevealRef}>
          <div className="social-panel-inner">
            <div className="social-section-heading">
              <header className="story-header"><span className="story-no">02</span><p className="mini">CONTENT PILLARS</p></header>
              <div className="story-heading"><h3>创作版图</h3><p>独立策划「音乐制作」、「Apple Music」与「热单翻唱」三大内容线，建立起听觉与视觉的账号审美形象。</p></div>
            </div>
            <div className="content-line-grid">
              {currentSocialContentPillars.map(item => <ContentLineFolder item={item} key={item.no} />)}
            </div>
          </div>
        </section>

        <section className="social-panel social-viral-panel" ref={socialViralRevealRef}>
          <div className="social-panel-inner">
            <div className="social-section-heading light">
              <header className="story-header"><span className="story-no">03</span><p className="mini">VIRAL WORKS</p></header>
              <div className="story-heading"><h3>爆款作品</h3><p>以作品质量为底色，以网感捕捉网络情绪与传播逻辑，让作品质量与网感共同驱动爆款打造。</p></div>
            </div>
            <ViralWorksShowcase works={currentSocialViralWorks} />
          </div>
        </section>

        <section className="social-panel social-trend-panel" ref={socialTrendRevealRef}>
          <div className="social-panel-inner">
            <div className="social-section-heading">
              <header className="story-header"><span className="story-no">04</span><p className="mini">CREATIVE MOMENTUM</p></header>
              <div className="story-heading"><h3>持续创作<br />持续增长</h3><p>持续创作、观察反馈、调整表达，让内容在一次次发布中找到更大的受众。粉丝量与观看量曲线均汇总各平台近 30 日真实数据。</p></div>
            </div>
            <div ref={trendDashboardRef} className={`trend-dashboard is-${trendAnimationState}`}>
              <article className="trend-card follower-chart">
                <div className="chart-head"><div><span>当月粉丝增长</span><strong className="follower-month-growth"><MetricValue value={followerChart?.monthGain ?? 0} /><i aria-hidden="true">↑</i></strong></div><b>{followerGrowthLabel} <small>近 30 日</small></b></div>
                <div className="chart-visual">
                  <div className="follower-plot">
                    <svg viewBox="0 0 760 236" preserveAspectRatio="none" role="img" aria-label={followerChart ? `近 30 日全网粉丝由 ${followerChart.first} 增长至 ${followerChart.latest}` : '近 30 日全网粉丝数据暂不可用'}>
                      <defs><linearGradient id="followersFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#151515" stopOpacity=".2"/><stop offset="1" stopColor="#151515" stopOpacity="0"/></linearGradient></defs>
                      <g className="chart-grid">{followerChart?.yTicks.map(tick => <line x1={FOLLOWER_CHART.left} y1={tick.y} x2={FOLLOWER_CHART.width - FOLLOWER_CHART.right} y2={tick.y} key={tick.value}/>)}</g>
                      {followerChart && <path className="chart-area" d={followerChart.areaPath}/>}
                      {followerChart && <path className="chart-line" pathLength="1" d={followerChart.linePath}/>}
                    </svg>
                    <div className="follower-y-axis" aria-hidden="true">{followerChart?.yTicks.map(tick => <span style={{ top: `${tick.y / FOLLOWER_CHART.height * 100}%` }} key={tick.value}>{new Intl.NumberFormat('zh-CN').format(tick.value)}</span>)}</div>
                  </div>
                  <div className="chart-axis follower-axis" aria-hidden="true">{followerChart?.labels.map(value => <span key={value}>{formatFollowerChartDate(value)}</span>)}</div>
                </div>
              </article>
              <article className="trend-card views-chart">
                <div className="chart-head"><div><span>观看量</span><strong className="follower-month-growth">{formatMetric(viewsChart?.periodGain ?? 0)}<i aria-hidden="true">↑</i></strong></div><b>{viewsGrowthLabel} <small>近 30 日</small></b></div>
                <div className="chart-visual">
                  <div className="follower-plot">
                    <svg viewBox="0 0 760 236" preserveAspectRatio="none" role="img" aria-label={viewsChart ? `近 30 日全网阅读观看存量由 ${viewsChart.first} 增长至 ${viewsChart.latest}` : '近 30 日全网阅读观看数据暂不可用'}>
                      <defs><linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#151515" stopOpacity=".2"/><stop offset="1" stopColor="#151515" stopOpacity="0"/></linearGradient></defs>
                      <g className="chart-grid">{viewsChart?.yTicks.map(tick => <line x1={FOLLOWER_CHART.left} y1={tick.y} x2={FOLLOWER_CHART.width - FOLLOWER_CHART.right} y2={tick.y} key={tick.value}/>)}</g>
                      {viewsChart && <path className="chart-area" d={viewsChart.areaPath}/>} 
                      {viewsChart && <path className="chart-line" pathLength="1" d={viewsChart.linePath}/>} 
                    </svg>
                    <div className="follower-y-axis" aria-hidden="true">{viewsChart?.yTicks.map(tick => <span style={{ top: `${tick.y / FOLLOWER_CHART.height * 100}%` }} key={tick.value}>{tick.value}</span>)}</div>
                  </div>
                  <div className="chart-axis follower-axis" aria-hidden="true">{viewsChart?.labels.map(value => <span key={value}>{formatFollowerChartDate(value)}</span>)}</div>
                </div>
              </article>
              <article className="trend-stat-card"><span>发布数量</span><strong>{formatMetric(initialSocialData?.bilibili?.video_count)}<sup>期</sup></strong><p>累计完成内容策划与发布</p></article>
              <article className="trend-stat-card"><span>更新稳定性</span><strong>4.5<sup>期/月</sup></strong><p>近 6 个月月均更新</p></article>
              <article className="trend-stat-card accent"><span>爆款率</span><strong>{viralRateLabel}{hasViralRate && <sup>%</sup>}</strong><p>播放量达到所有视频中位数 2 倍的视频占比</p></article>
            </div>
          </div>
        </section>

        <section className="social-panel social-audience-panel" ref={socialAudienceRevealRef}>
          <div className="social-panel-inner">
            <div className="social-section-heading">
              <header className="story-header"><span className="story-no">05</span><p className="mini">ENGAGEMENT & AUDIENCE</p></header>
              <div className="story-heading"><h3>互动质量与受众</h3><p>不止关注内容被看见多少次，也关注谁在看、看完之后如何回应，并将这些反馈用于下一轮创作。</p></div>
            </div>
            <div ref={audienceGridRef} className={`audience-grid is-${audienceAnimationState}`}>
              <article className="interaction-card">
                <header className="audience-panel-heading">
                  <div><h4>互动质量</h4><p>不同互动行为的占比，体现观众对内容的认可方式。</p></div>
                </header>
                <div className="interaction-card-body">
                  <div className="interaction-donut" style={{ '--segment-1': `${interactionStops[0]}%`, '--segment-2': `${interactionStops[1]}%`, '--segment-3': `${interactionStops[2]}%` }} aria-label={`互动类型占比：${interactionBreakdown.map(([label, , rate]) => `${label} ${rate}`).join('，')}`}><div><strong><MetricValue value={totalSocial.engagement} /></strong><span>总互动量</span></div></div>
                  <div className="interaction-legend">
                    {interactionBreakdown.map(([label,value,rate],index)=><div key={label}><i className={`legend-c${index+1}`}></i><span>{label}</span><b>{value}</b><small>{rate}</small></div>)}
                  </div>
                </div>
              </article>
              <section className="audience-portrait-card">
                <header className="audience-portrait-heading">
                  <div><h4>受众画像</h4><p>从年龄、性别、地域与兴趣，理解内容所连接的人群。</p></div>
                  <div className="course-tabs" role="tablist" aria-label="受众平台">
                    {Object.entries(audienceProfiles).map(([key, profile]) => <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={activeAudiencePlatform === key}
                      aria-controls="audience-platform-panel"
                      className={activeAudiencePlatform === key ? 'active' : ''}
                      onClick={() => setActiveAudiencePlatform(key)}
                    >{profile.name}</button>)}
                  </div>
                </header>
                <div className="audience-platform-panel" id="audience-platform-panel" role="tabpanel" aria-label={`${activeAudience.name}受众信息`} key={activeAudiencePlatform}>
                  <article className="audience-card age-card">
                    <div className="audience-card-head"><span>年龄分布</span></div>
                    <div className="audience-age-rows">
                    {activeAudience.age.map(([label,value])=><div className="audience-bar" key={label}><span>{label}</span><i><b style={{width:`${Number.parseFloat(value) / maxAudienceAge * 100}%`}}></b></i><strong>{value}</strong></div>)}
                    </div>
                  </article>
                  <article className="audience-card gender-card">
                    <div className="audience-card-head"><span>性别分布</span></div>
                    <div className="gender-visual"><div className="gender-donut" style={{ '--gender-stop-1': `${genderStops[0]}%`, '--gender-stop-2': `${genderStops[1]}%` }}></div><div>{activeAudience.gender.map(([label, value]) => <p key={label}><i></i>{label} <b>{value}</b></p>)}</div></div>
                  </article>
                  <article className="audience-card region-card">
                    <div className="audience-card-head"><span>地域分布</span></div>
                    {activeAudience.regions.map(([label,value],index)=><div className="region-row" key={label}><b>0{index+1}</b><span>{label}</span><i><em style={{width:`${Number.parseFloat(value) / maxAudienceRegion * 100}%`}}></em></i><strong>{value}</strong></div>)}
                  </article>
                  <article className="audience-card interest-card">
                    <div className="audience-card-head"><span>兴趣标签</span></div>
                    <div>{activeAudience.interests.map(interest => <b key={interest}>{interest}</b>)}</div>
                  </article>
                </div>
              </section>
            </div>
            <footer className="page-section-footer social-section-footer"><span>© 2026 AUGUST PEI</span><a className="contact-back-home" href="#home">BACK TO HOME <span aria-hidden="true">↑</span></a></footer>
          </div>
        </section>
      </section>}

      {page === 'skills' && <section className="section skills" id="skills">
        <div className="skills-overview">
          <div className="skills-overview-heading">
            <SectionHead kicker="CREATIVE TOOLKIT" title="专业技能" />
            <p className="skills-overview-copy">把音乐制作、AI、内容创作与编程能力放进同一套工作流，不同技能协同起来，让创意从想法顺利走向成品。</p>
          </div>
          <div className="skill-layout">
            <div className="skill-stack">{skillGroups.map((g, i) => <article key={g.title}>
              <div className="skill-copy"><span>0{i+1}</span><h3>{g.title}</h3><div className="skill-tags">{g.items.map(x => <b key={x}>{x}</b>)}</div></div>
              <figure className="skill-image"><img src={g.image} alt="" loading="eager" decoding="async" /></figure>
            </article>)}</div>
          </div>
        </div>
        <AlbumWall />
        <section className="skills-listening-section editorial-title-reference" aria-labelledby="skills-listening-title">
          <div className="skills-listening-inner">
            <header className="editorial-heading-row">
              <div><p className="mini">NOW IN ROTATION</p><h3 id="skills-listening-title">最近在听</h3></div>
              <p className="editorial-heading-copy">持续聆听，从当下最受关注的新作到经得起时间检验的经典，在流行与历史之间不断拓宽音乐视野。</p>
            </header>
          </div>
          <CoverflowCarousel slides={recentAlbums} />
          <footer className="page-section-footer listening-section-footer"><span>© 2026 AUGUST PEI</span><a className="contact-back-home" href="#home">BACK TO HOME <span aria-hidden="true">↑</span></a></footer>
        </section>
      </section>}

      {page === 'contact' && <section className="contact" id="contact">
        <DitherCursor color="#f1f9d1" />
        <CurvedLoop marqueeText="AUGUST PEI ✦ " speed={0.25} curveAmount={290} direction="right" className="contact-loop-text" />
        <div className="contact-content">
          <p className="mini">AVAILABLE FOR OPPORTUNITIES</p>
          <LayoutGroup>
            <motion.h2 className="contact-title" layout transition={{ layout: { type: 'spring', stiffness: 240, damping: 19, mass: 0.8 } }}>
              <motion.span layout="position" transition={{ layout: { type: 'spring', stiffness: 240, damping: 19, mass: 0.8 } }}>Let's</motion.span>
              <RotatingText
                texts={['create', 'produce', 'sing', 'code', 'compose', 'prompt', 'generate', 'orchestrate', 'tune', 'ship', 'think']}
                mainClassName="contact-rotating-text"
                staggerFrom="last"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-120%' }}
                staggerDuration={0.025}
                splitLevelClassName="contact-rotating-word"
                transition={{ type: 'spring', damping: 20, stiffness: 260, mass: 0.8 }}
                rotationInterval={2600}
              />
            </motion.h2>
          </LayoutGroup>
          <p className="contact-description">制作编曲 / AIGC 音乐 / 音乐内容运营相关机会与合作<span className="contact-description-break">{' '}</span><span className="contact-description-ending">欢迎联系！</span></p>
          <a className="contact-mail" href="/resume/制作岗个人简历Ver1.docx" download="裴宇航-个人简历.docx">下载个人简历 <ArrowDown size={24}/></a>
          <div className="contact-row">
            <a href="tel:+8613588038441"><Phone size={16}/><span>+86 135 8803 8441</span></a>
            <a href="mailto:yuhangpei322@gmail.com"><Mail size={16}/><span>yuhangpei322@gmail.com</span></a>
            <a href="https://xhslink.cn/o/AYwpy9DqQTa" target="_blank" rel="noopener noreferrer"><img className="contact-xhs-logo" src={xhsWordmark} alt="小红书"/><span>@August_pp</span></a>
            <span><MapPin size={16}/><span>Hangzhou, China</span></span>
          </div>
        </div>
        <footer><span>© 2026 AUGUST PEI</span><a className="contact-back-home" href="#home">BACK TO HOME <span aria-hidden="true">↑</span></a></footer>
      </section>}
    </main>
    <audio
      ref={audioRef}
      src={currentTrack.src}
      preload="metadata"
      onTimeUpdate={event => {
        const audio = event.currentTarget
        setCurrentTime(audio.currentTime)
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setDuration(previous => previous === audio.duration ? previous : audio.duration)
        }
      }}
      onLoadedMetadata={event => setDuration(event.currentTarget.duration || 0)}
      onDurationChange={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
      onEnded={playNext}
    />
    {hasStartedMusic && <FloatingPlayer
      track={currentTrack}
      page={page}
      isPlaying={isPlaying}
      currentTime={currentTime}
      duration={duration}
      onToggle={() => setIsPlaying(playing => !playing)}
      onNext={playNext}
      onSeek={seekTo}
      compact={isPlayerCompact}
      closing={isPlayerClosing}
      onCompactToggle={() => setIsPlayerCompact(compact => !compact)}
      onClose={closePlayer}
    />}
  </>
}

function SectionHead({ kicker, title, light=false }) {
  return <div className={`section-head ${light ? 'light' : ''}`}><div><p className="mini">{kicker}</p><h2>{title}</h2></div></div>
}

function ArrangementDetails() {
  const [activeIndex, setActiveIndex] = useState(() => {
    try {
      const returnTone = sessionStorage.getItem(RETURN_TO_ARRANGEMENT_KEY)
      const returnIndex = arrangementDetails.findIndex(detail => detail.tone === returnTone)
      return returnIndex >= 0 ? returnIndex : 0
    } catch {
      return 0
    }
  })
  const [isPaused, setIsPaused] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const pointerStart = useRef(null)
  const carouselRef = useRef(null)
  const wheelDistance = useRef(0)
  const wheelResetTimer = useRef(0)
  const wheelLocked = useRef(false)
  const wheelLastEvent = useRef(0)
  const wheelLastMagnitude = useRef(0)
  const wheelTriggeredAt = useRef(0)

  const selectSlide = index => {
    setActiveIndex((index + arrangementDetails.length) % arrangementDetails.length)
  }

  const openDetail = (event, detail) => {
    if (!['blank-space', 'three-sixty'].includes(detail.tone)) return
    event.preventDefault()
    window.location.hash = detail.tone === 'blank-space' ? 'drum-layering' : 'synth-design'
  }

  useEffect(() => {
    if (isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setTimeout(() => selectSlide(activeIndex + 1), 6500)
    return () => window.clearTimeout(timer)
  }, [activeIndex, isPaused])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const onWheel = event => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 2) return
      event.preventDefault()
      const now = performance.now()
      const magnitude = Math.abs(event.deltaX)
      const startedAfterPause = now - wheelLastEvent.current > 180
      const startedWithNewImpulse = wheelLocked.current &&
        now - wheelTriggeredAt.current > 320 &&
        magnitude > Math.max(12, wheelLastMagnitude.current * 2.3)

      if (startedAfterPause || startedWithNewImpulse) {
        wheelDistance.current = 0
        wheelLocked.current = false
      }

      wheelLastEvent.current = now
      wheelLastMagnitude.current = magnitude
      window.clearTimeout(wheelResetTimer.current)
      wheelDistance.current += event.deltaX
      wheelResetTimer.current = window.setTimeout(() => {
        wheelDistance.current = 0
        wheelLocked.current = false
        wheelLastEvent.current = 0
        wheelLastMagnitude.current = 0
      }, 180)

      if (wheelLocked.current || Math.abs(wheelDistance.current) < 46) return
      const direction = wheelDistance.current > 0 ? 1 : -1
      wheelDistance.current = 0
      wheelLocked.current = true
      wheelTriggeredAt.current = now
      setActiveIndex(index => (index + direction + arrangementDetails.length) % arrangementDetails.length)
    }

    carousel.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      carousel.removeEventListener('wheel', onWheel)
      window.clearTimeout(wheelResetTimer.current)
      wheelLocked.current = false
    }
  }, [])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    let frame = 0
    const updateControlsVisibility = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const rect = carousel.getBoundingClientRect()
        const viewportHeight = window.visualViewport?.height || window.innerHeight
        const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0))
        const nextVisible = visibleHeight >= viewportHeight / 3
        setControlsVisible(current => current === nextVisible ? current : nextVisible)
      })
    }

    updateControlsVisibility()
    window.addEventListener('scroll', updateControlsVisibility, { passive: true })
    window.addEventListener('resize', updateControlsVisibility)
    window.visualViewport?.addEventListener('resize', updateControlsVisibility)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateControlsVisibility)
      window.removeEventListener('resize', updateControlsVisibility)
      window.visualViewport?.removeEventListener('resize', updateControlsVisibility)
    }
  }, [])

  const onPointerDown = event => {
    pointerStart.current = { x: event.clientX, y: event.clientY }
  }

  const onPointerUp = event => {
    if (!pointerStart.current) return
    const deltaX = event.clientX - pointerStart.current.x
    const deltaY = event.clientY - pointerStart.current.y
    pointerStart.current = null
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return
    selectSlide(activeIndex + (deltaX < 0 ? 1 : -1))
  }

  return <section className={`arrangement-details${isPaused ? ' is-paused' : ''}${controlsVisible ? ' has-visible-controls' : ''}`} aria-labelledby="arrangement-details-title">
    <div className="arrangement-details-head">
      <div>
        <p className="mini">A CLOSER LISTEN</p>
        <h2 id="arrangement-details-title">看看编曲细节</h2>
      </div>
      <p>精心打磨每一个作品的细节，推敲每一个音符。<br/>走进每一首歌，拆解每一个精妙的制作选择。</p>
    </div>

    <div ref={carouselRef} className="arrangement-carousel" aria-roledescription="轮播图" aria-label="编曲细节案例">
      <div
        className="arrangement-track"
        style={{ transform: `translate3d(calc(${activeIndex * -100}% - ${activeIndex * 18}px), 0, 0)` }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { pointerStart.current = null }}
      >
        {arrangementDetails.map((detail, index) => <article
          className={`arrangement-card ${detail.tone}`}
          key={detail.eyebrow}
          aria-hidden={activeIndex !== index}
        >
          <div className="arrangement-card-copy">
            <p className="arrangement-eyebrow">{detail.eyebrow}</p>
            <h3>{detail.title}</h3>
            <p className="arrangement-description">{detail.description}</p>
            <a className="arrangement-cta arrangement-cta-desktop" href={detail.href} target={['blank-space', 'three-sixty'].includes(detail.tone) ? undefined : '_blank'} rel={['blank-space', 'three-sixty'].includes(detail.tone) ? undefined : 'noreferrer'} onClick={event => openDetail(event, detail)} tabIndex={activeIndex === index ? 0 : -1}>
              <span className="arrangement-cta-play"><Play size={17} fill="currentColor"/></span>
              <span>进入交互拆解</span>
              <ArrowUpRight size={22}/>
            </a>
          </div>
          <div className="arrangement-art" aria-hidden="true">
            <div className="arrangement-frame">
              <img src={detail.cover} alt="" />
            </div>
            <span className="arrangement-script">{detail.eyebrow.split(' · ')[0]}</span>
            <p>{detail.quote}</p>
          </div>
          <div className="arrangement-card-footer">
            <a className="arrangement-cta arrangement-cta-mobile" href={detail.href} target={['blank-space', 'three-sixty'].includes(detail.tone) ? undefined : '_blank'} rel={['blank-space', 'three-sixty'].includes(detail.tone) ? undefined : 'noreferrer'} onClick={event => openDetail(event, detail)} tabIndex={activeIndex === index ? 0 : -1}>
              <span className="arrangement-cta-play"><Play size={17} fill="currentColor"/></span>
              <span>进入交互拆解</span>
              <ArrowUpRight size={22}/>
            </a>
            <div className="arrangement-card-tags" aria-label="编曲标签">
              {detail.tags.map(tag => <span key={tag}>{tag}</span>)}
            </div>
          </div>
        </article>)}
      </div>
    </div>

    <div className="arrangement-controls">
      <button type="button" className="arrangement-arrow" onClick={() => selectSlide(activeIndex - 1)} aria-label="上一个编曲细节"><ChevronLeft/></button>
      <div className="arrangement-dots" role="tablist" aria-label="选择编曲细节">
        {arrangementDetails.map((detail, index) => <button
          type="button"
          key={detail.eyebrow}
          className={activeIndex === index ? 'active' : ''}
          onClick={() => selectSlide(index)}
          role="tab"
          aria-selected={activeIndex === index}
          aria-label={`查看第 ${index + 1} 项：${detail.eyebrow}`}
        ><span/></button>)}
      </div>
      <button type="button" className="arrangement-arrow" onClick={() => selectSlide(activeIndex + 1)} aria-label="下一个编曲细节"><ChevronRight/></button>
      <button type="button" className="arrangement-pause" onClick={() => setIsPaused(paused => !paused)} aria-label={isPaused ? '继续自动轮播' : '暂停自动轮播'}>
        {isPaused ? <Play size={17} fill="currentColor"/> : <Pause size={17} fill="currentColor"/>}
      </button>
    </div>
    <footer className="page-section-footer arrangement-section-footer"><span>© 2026 AUGUST PEI</span><a className="contact-back-home" href="#home">BACK TO HOME <span aria-hidden="true">↑</span></a></footer>
  </section>
}

const synthSoundLayers = [
  {
    id: 'osc-a', audioKey: 'oscA', no: '01', name: 'Lead 1', source: 'OSC A', wavetable: 'Square', waveformAmount: 42, type: 'lead-square',
    image: synthLeadOneImage,
    description: '富有弹性的主旋律骨架',
    params: [
      { id: 'pwm', label: 'PWM', value: 70, unit: '%' },
      { id: 'level', label: 'LEVEL', value: 62, unit: '%' },
    ],
  },
  {
    id: 'osc-b', audioKey: 'oscB', no: '02', name: 'Lead 2', source: 'OSC B', wavetable: 'Basic_Wrd', waveformAmount: 67, type: 'lead-pulse',
    image: synthLeadTwoImage,
    description: '有弹性且略带数字质感的补充',
    params: [
      { id: 'fin', label: 'FIN', value: 7, unit: ' cents' },
      { id: 'position', label: 'WT POS', value: 256, unit: '' },
      { id: 'pwm', label: 'PWM', value: 82, unit: '%' },
      { id: 'level', label: 'LEVEL', value: 48, unit: '%' },
    ],
  },
  {
    id: 'sub-body', audioKey: 'subBody', no: '03', name: 'Sub body', source: 'OSC C', wavetable: 'Sine', waveformAmount: 12, type: 'sine',
    image: synthSubBodyImage,
    description: '稳定、圆润的低频重量',
    params: [
      { id: 'octave', label: 'OCT', value: -1, unit: ' oct' },
      { id: 'unison', label: 'UNISON', value: 4, unit: ' voices' },
      { id: 'detune', label: 'DETUNE', value: 0.07, unit: '' },
      { id: 'level', label: 'LEVEL', value: 22, unit: '%' },
    ],
  },
  {
    id: 'noise', audioKey: 'noise', no: '04', name: 'Noise', source: 'OSC NOISE', wavetable: 'J106 Chorus', waveformAmount: 62, type: 'chorus-noise',
    image: synthNoiseImage,
    description: '颗粒感与高频边缘',
    params: [
      { id: 'level', label: 'LEVEL', value: 28, unit: '%' },
    ],
  },
  {
    id: 'air', audioKey: 'air', no: '05', name: 'Air', source: 'OSC SUB', wavetable: 'Square', waveformAmount: 78, type: 'single-square',
    image: synthAirImage,
    description: '扩展顶部空气感与立体声宽度',
    params: [
      { id: 'octave', label: 'OCT', value: '+1', unit: ' oct' },
      { id: 'level', label: 'LEVEL', value: 20, unit: '%' },
    ],
  },
]

const synthLayerAudio = {
  withFilter: {
    oscA: synthWithFilterOscAAudio,
    oscB: synthWithFilterOscBAudio,
    oscABypassEnvelope: synthWithFilterOscABypassEnvelopeAudio,
    oscBBypassEnvelope: synthWithFilterOscBBypassEnvelopeAudio,
    subBody: synthWithFilterSubBodyAudio,
    noise: synthWithFilterNoiseAudio,
    air: synthWithFilterAirAudio,
  },
  withoutFilter: {
    oscA: synthWithoutFilterOscAAudio,
    oscB: synthWithoutFilterOscBAudio,
    oscABypassEnvelope: synthWithoutFilterOscABypassEnvelopeAudio,
    oscBBypassEnvelope: synthWithoutFilterOscBBypassEnvelopeAudio,
    subBody: synthWithoutFilterSubBodyAudio,
    noise: synthWithoutFilterNoiseAudio,
    air: synthWithoutFilterAirAudio,
  },
  withFilterBypassEnvelope: {
    oscA: synthFilterEnvelopeBypassOscAAudio,
    oscB: synthFilterEnvelopeBypassOscBAudio,
    oscABypassEnvelope: synthFilterEnvelopeBypassOscABypassEnvelopeAudio,
    oscBBypassEnvelope: synthFilterEnvelopeBypassOscBBypassEnvelopeAudio,
    subBody: synthFilterEnvelopeBypassSubBodyAudio,
    noise: synthFilterEnvelopeBypassNoiseAudio,
    air: synthFilterEnvelopeBypassAirAudio,
  },
}

const synthDelayAudioSources = {
  withoutDelay: synthWithoutDelayAudio,
  delay: synthDelayAudio,
  delayLfo: synthDelayWithLfoAudio,
}

const synthFilterRoutes = [
  { id: 'air', label: 'S', name: 'Sub' },
  { id: 'osc-a', label: 'A', name: 'OSC A' },
  { id: 'osc-b', label: 'B', name: 'OSC B' },
  { id: 'sub-body', label: 'C', name: 'OSC C' },
  { id: 'noise', label: 'N', name: 'Noise' },
]

const SYNTH_LAYER_BPM = 120
const SYNTH_LAYER_BARS = 4
const SYNTH_LAYER_BEATS = 4
const SYNTH_LAYER_BAR_DURATION = 60 / SYNTH_LAYER_BPM * SYNTH_LAYER_BEATS
const SYNTH_LAYER_DURATION = SYNTH_LAYER_BAR_DURATION * SYNTH_LAYER_BARS
const SYNTH_LAYER_SIXTEENTH_DURATION = 60 / SYNTH_LAYER_BPM / 4
const SYNTH_FILTER_MIN_CUTOFF = 441
const SYNTH_FILTER_MAX_CUTOFF = 3379
const SYNTH_FILTER_TRIGGER_POSITIONS = [
  [1, 1, 1], [1, 1, 3], [1, 2, 1], [1, 2, 3], [1, 2, 4], [1, 3, 2], [1, 3, 3],
  [2, 1, 1], [2, 1, 3], [2, 2, 1], [2, 2, 3], [2, 2, 4], [2, 3, 2], [2, 3, 3],
  [3, 1, 1], [3, 1, 3], [3, 2, 1], [3, 2, 3], [3, 2, 4], [3, 3, 2], [3, 3, 3],
  [4, 1, 3], [4, 2, 1], [4, 2, 3], [4, 2, 4], [4, 3, 2], [4, 3, 3], [4, 4, 3],
]
const SYNTH_FILTER_TRIGGER_TIMES = SYNTH_FILTER_TRIGGER_POSITIONS.map(([bar, beat, sixteenth]) => (
  (bar - 1) * SYNTH_LAYER_BAR_DURATION
  + (beat - 1) * 60 / SYNTH_LAYER_BPM
  + (sixteenth - 1) * SYNTH_LAYER_SIXTEENTH_DURATION
))

const SYNTH_DRUM_BPM = 120
const SYNTH_DRUM_BARS = 12
const SYNTH_DRUM_BEATS = 4
const SYNTH_DRUM_BAR_DURATION = 60 / SYNTH_DRUM_BPM * SYNTH_DRUM_BEATS
const SYNTH_DRUM_DURATION = SYNTH_DRUM_BAR_DURATION * SYNTH_DRUM_BARS
const SYNTH_DRUM_BEAT_DURATION = 60 / SYNTH_DRUM_BPM
const synthDawSynthRegions = [
  { id: 'part-a', startBeat: 0, sourceStartBeat: 0, durationBeats: 16 },
  { id: 'part-b', startBeat: 16, sourceStartBeat: 16, durationBeats: 15 },
  { id: 'part-a-repeat', startBeat: 32, sourceStartBeat: 0, durationBeats: 15 },
]
const synthDrumTracks = [
  { id: 'synth-lead', label: 'Lead Synth', color: '#d8ff45', src: synthDawLeadAudio, regions: synthDawSynthRegions },
  { id: 'sub-synth', label: 'Sub Synth', color: '#d8ff45', src: synthDawSubAudio, regions: synthDawSynthRegions },
  { id: 'chorus-synth', label: 'Chorus Synth', color: '#d8ff45', src: synthDawChorusAudio, regions: synthDawSynthRegions },
  { id: 'buzz-synth', label: 'Buzz Synth', color: '#d8ff45', src: synthDawBuzzAudio, regions: [{ id: 'buzz', startBeat: 32, sourceStartBeat: 0, durationBeats: 15 }] },
  { id: 'vocal', label: 'Vocal', color: '#9daa7d', src: synthDawVocalAudio, regions: [{ id: 'vocal', startBeat: 0, sourceStartBeat: 0, durationBeats: 48 }] },
  { id: 'others', label: 'Others', color: '#9daa7d', src: synthDawOthersAudio, regions: [{ id: 'others', startBeat: 0, sourceStartBeat: 0, durationBeats: 48 }] },
]

function renderSynthDawTrack(context, sourceBuffer, regions) {
  const frameCount = Math.round(SYNTH_DRUM_DURATION * sourceBuffer.sampleRate)
  const renderedBuffer = context.createBuffer(sourceBuffer.numberOfChannels, frameCount, sourceBuffer.sampleRate)

  regions.forEach(region => {
    const sourceStartFrame = Math.round(region.sourceStartBeat * SYNTH_DRUM_BEAT_DURATION * sourceBuffer.sampleRate)
    const targetStartFrame = Math.round(region.startBeat * SYNTH_DRUM_BEAT_DURATION * sourceBuffer.sampleRate)
    const requestedFrames = Math.round(region.durationBeats * SYNTH_DRUM_BEAT_DURATION * sourceBuffer.sampleRate)
    const copyFrames = Math.max(0, Math.min(requestedFrames, sourceBuffer.length - sourceStartFrame, frameCount - targetStartFrame))
    if (!copyFrames) return

    for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel += 1) {
      const sourceData = sourceBuffer.getChannelData(channel).subarray(sourceStartFrame, sourceStartFrame + copyFrames)
      renderedBuffer.getChannelData(channel).set(sourceData, targetStartFrame)
    }
  })

  return renderedBuffer
}

function synthEnvelopeTimingAt(position) {
  const loopPosition = ((position % SYNTH_LAYER_DURATION) + SYNTH_LAYER_DURATION) % SYNTH_LAYER_DURATION
  let triggerTime = SYNTH_FILTER_TRIGGER_TIMES[SYNTH_FILTER_TRIGGER_TIMES.length - 1] - SYNTH_LAYER_DURATION
  let nextTriggerTime = SYNTH_FILTER_TRIGGER_TIMES[0]

  for (let index = 0; index < SYNTH_FILTER_TRIGGER_TIMES.length; index += 1) {
    const time = SYNTH_FILTER_TRIGGER_TIMES[index]
    if (time > loopPosition) {
      nextTriggerTime = time
      break
    }
    triggerTime = time
    nextTriggerTime = index < SYNTH_FILTER_TRIGGER_TIMES.length - 1
      ? SYNTH_FILTER_TRIGGER_TIMES[index + 1]
      : SYNTH_LAYER_DURATION + SYNTH_FILTER_TRIGGER_TIMES[0]
  }

  return {
    elapsed: loopPosition - triggerTime,
    triggerInterval: nextTriggerTime - triggerTime,
  }
}

function synthEnvelopeLevelAt(position, envelope) {
  const { elapsed } = synthEnvelopeTimingAt(position)

  const attack = Math.max(.0001, envelope.attack / 1000)
  const decay = Math.max(.0001, envelope.decay / 1000)
  const sustain = Math.max(0, Math.min(1, envelope.sustain / 100))
  const release = Math.max(.0001, envelope.release / 1000)
  const gate = SYNTH_LAYER_SIXTEENTH_DURATION

  if (elapsed < attack) return elapsed / attack
  if (elapsed < gate) return 1 - (1 - sustain) * Math.min(1, (elapsed - attack) / decay)

  const levelAtRelease = 1 - (1 - sustain) * Math.min(1, (gate - attack) / decay)
  if (elapsed < gate + release) return levelAtRelease * (1 - (elapsed - gate) / release)
  return 0
}

function cubicBezierPoint(points, progress) {
  const inverse = 1 - progress
  const startWeight = inverse ** 3
  const controlOneWeight = 3 * inverse ** 2 * progress
  const controlTwoWeight = 3 * inverse * progress ** 2
  const endWeight = progress ** 3
  return {
    x: points[0].x * startWeight + points[1].x * controlOneWeight + points[2].x * controlTwoWeight + points[3].x * endWeight,
    y: points[0].y * startWeight + points[1].y * controlOneWeight + points[2].y * controlTwoWeight + points[3].y * endWeight,
  }
}

const SYNTH_ENVELOPE_CURVE_SEGMENTS = [
  [{ x: 18, y: 176 }, { x: 37, y: 168 }, { x: 50, y: 79 }, { x: 72, y: 30 }],
  [{ x: 72, y: 30 }, { x: 104, y: 40 }, { x: 190, y: 105 }, { x: 276, y: 112 }],
  [{ x: 276, y: 112 }, { x: 350, y: 112 }, { x: 430, y: 112 }, { x: 506, y: 112 }],
  [{ x: 506, y: 112 }, { x: 570, y: 112 }, { x: 620, y: 145 }, { x: 694, y: 176 }],
]
// Keep the rise and release brisk while giving the decay/sustain portion most of
// the available time. A new note still replaces this single progress point.
const SYNTH_ENVELOPE_SEGMENT_TIMING = [.02, .56, .38, .04]

function synthEnvelopePointAt(progress) {
  let remaining = Math.max(0, Math.min(1, progress))
  for (let index = 0; index < SYNTH_ENVELOPE_CURVE_SEGMENTS.length; index += 1) {
    const segmentTiming = SYNTH_ENVELOPE_SEGMENT_TIMING[index]
    if (remaining <= segmentTiming || index === SYNTH_ENVELOPE_CURVE_SEGMENTS.length - 1) {
      return cubicBezierPoint(SYNTH_ENVELOPE_CURVE_SEGMENTS[index], Math.min(1, remaining / segmentTiming))
    }
    remaining -= segmentTiming
  }
  return { x: 694, y: 176 }
}

const DELAY_LFO_CURVE_START = { x: 14, y: 256 }
const DELAY_LFO_CURVE_KNEE = { x: 405, y: 92 }
const DELAY_LFO_CURVE_END = { x: 706, y: 14 }
const DELAY_LFO_RISE_POINTS = [
  DELAY_LFO_CURVE_START,
  { x: 175, y: 256 },
  { x: 302, y: 238 },
  DELAY_LFO_CURVE_KNEE,
]

const DELAY_TAPS = [
  { beat: .5, amplitude: 1, db: 0 },
  { beat: 1, amplitude: .2, db: -14 },
  { beat: 1.5, amplitude: .04, db: -28 },
  { beat: 2, amplitude: .008, db: -41.9 },
  { beat: 2.5, amplitude: .0016, db: -55.9 },
]

function delayLfoLevelAt(progress) {
  const phase = Math.max(0, Math.min(1, progress))
  const x = DELAY_LFO_CURVE_START.x + phase * (DELAY_LFO_CURVE_END.x - DELAY_LFO_CURVE_START.x)
  let y

  if (x <= DELAY_LFO_CURVE_KNEE.x) {
    let lower = 0
    let upper = 1
    for (let index = 0; index < 14; index += 1) {
      const midpoint = (lower + upper) / 2
      if (cubicBezierPoint(DELAY_LFO_RISE_POINTS, midpoint).x < x) lower = midpoint
      else upper = midpoint
    }
    y = cubicBezierPoint(DELAY_LFO_RISE_POINTS, (lower + upper) / 2).y
  } else {
    const lineProgress = (x - DELAY_LFO_CURVE_KNEE.x) / (DELAY_LFO_CURVE_END.x - DELAY_LFO_CURVE_KNEE.x)
    y = DELAY_LFO_CURVE_KNEE.y + (DELAY_LFO_CURVE_END.y - DELAY_LFO_CURVE_KNEE.y) * lineProgress
  }

  return Math.max(0, Math.min(1, (DELAY_LFO_CURVE_START.y - y) / (DELAY_LFO_CURVE_START.y - DELAY_LFO_CURVE_END.y)))
}

const initialSynthParams = Object.fromEntries(synthSoundLayers.map(layer => [
  layer.id,
  Object.fromEntries(layer.params.map(param => [param.id, param.value])),
]))

const synthMatrixRows = [
  { id: 'global-amp', destination: 'Global Amp', detail: '总输出音量', value: 'Default', percent: '100%' },
  { id: 'filter-cutoff', destination: 'Filter Cutoff', detail: '滤波器截止频率', value: '441 → 3379', percent: '27%', bypassable: true },
  { id: 'osc-a-pwm', destination: 'OSC A PWM', detail: '振荡器 A 脉冲宽度', value: '73 → 70', percent: '3%', bypassable: true },
  { id: 'osc-b-wt-pos', destination: 'OSC B WT POS', detail: '振荡器 B 波形位置', value: '256 → 242', percent: '-6%', bypassable: true },
]

const SYNTH_LEAD_PULSE_BASE_POINTS = [
  [0, -.18], [3, .82], [9, .98], [25, .96], [31, .88], [38, .95],
  [278, .78], [280, .9], [283, -1], [582, -.82], [589, .05], [720, .03],
]
const SYNTH_LEAD_PULSE_PEAK_POINTS = [
  [0, .08], [5, .78], [27, .84], [156, 1], [198, .86], [202, .73],
  [276, .58], [279, -.58], [445, -1], [450, -.78], [454, -1],
  [580, -.56], [587, .03], [720, .02],
]
const SYNTH_LEAD_PULSE_MORPH_X = [...new Set([
  ...SYNTH_LEAD_PULSE_BASE_POINTS.map(([x]) => x),
  ...SYNTH_LEAD_PULSE_PEAK_POINTS.map(([x]) => x),
])].sort((a, b) => a - b)

function synthPolylineValueAt(points, x) {
  for (let index = 1; index < points.length; index += 1) {
    const [nextX, nextValue] = points[index]
    if (x > nextX) continue
    const [previousX, previousValue] = points[index - 1]
    const progress = nextX === previousX ? 1 : (x - previousX) / (nextX - previousX)
    return previousValue + (nextValue - previousValue) * progress
  }
  return points[points.length - 1][1]
}

function synthWavePath(type, amount = 50, morphAmount = 0) {
  const amplitude = 46 + amount * .24
  const y = value => (130 - value * amplitude).toFixed(1)

  if (type === 'lead-square') {
    const morph = Math.max(0, Math.min(1, morphAmount))
    const firstEdge = 256 + (251 - 256) * morph
    const secondEdge = 516 + (506 - 516) * morph
    return `M 0 ${y(1)} H ${firstEdge.toFixed(1)} V ${y(-1)} H ${secondEdge.toFixed(1)} V ${y(1)} H 720`
  }

  if (type === 'lead-pulse') {
    const morph = Math.max(0, Math.min(1, morphAmount))
    return SYNTH_LEAD_PULSE_MORPH_X.map((x, index) => {
      const baseValue = synthPolylineValueAt(SYNTH_LEAD_PULSE_BASE_POINTS, x)
      const peakValue = synthPolylineValueAt(SYNTH_LEAD_PULSE_PEAK_POINTS, x)
      const value = baseValue + (peakValue - baseValue) * morph
      return `${index ? 'L' : 'M'} ${x} ${y(value)}`
    }).join(' ')
  }

  if (type === 'square') {
    return `M 0 ${y(1)} H 120 V ${y(-1)} H 240 V ${y(1)} H 360 V ${y(-1)} H 480 V ${y(1)} H 600 V ${y(-1)} H 720`
  }

  if (type === 'single-square') {
    return `M 0 ${y(1)} H 360 V ${y(-1)} H 720`
  }

  if (type === 'chorus-noise') {
    const points = 240
    return Array.from({ length: points + 1 }, (_, index) => {
      const seed = Math.sin((index + 1) * 12.9898 + 4.1414) * 43758.5453
      const random = (seed - Math.floor(seed)) * 2 - 1
      const flutter = Math.sin(index * 2.31) * .15 + Math.sin(index * .37) * .08
      const value = Math.max(-1, Math.min(1, random * .86 + flutter))
      return `${index ? 'L' : 'M'} ${(index / points * 720).toFixed(1)} ${y(value)}`
    }).join(' ')
  }

  const points = 96
  const values = Array.from({ length: points + 1 }, (_, index) => {
    const phase = index / points * Math.PI * (type === 'sine' ? 2 : 6)
    if (type === 'sine') return Math.sin(phase)
    if (type === 'noise') return Math.sin(phase * 3.7) * .38 + Math.sin(phase * 8.2) * .24 + Math.sin(phase * 1.15) * .28
    if (type === 'fold') return Math.sin(phase) * .68 + Math.sin(phase * 2.03) * .27 + Math.sin(phase * 4.08) * .12
    return Math.sin(phase) * .54 + Math.sin(phase * 2) * .3 + Math.sin(phase * 5) * .13
  })
  return values.map((value, index) => `${index ? 'L' : 'M'} ${(index / points * 720).toFixed(1)} ${(130 - value * amplitude).toFixed(1)}`).join(' ')
}

function SynthRange({ label, value, unit = '%', compact = false, disabled = false, highlighted = false }) {
  return <div className={`synth-range is-fixed${compact ? ' is-compact' : ''}${disabled ? ' is-disabled' : ''}${highlighted ? ' is-envelope-highlighted' : ''}`}>
    <span><b>{label}</b><strong>{value}{unit}</strong></span>
  </div>
}

function SynthDrumSection() {
  const [mutedTracks, setMutedTracks] = useState(() => new Set(['vocal', 'others']))
  const [soloedTracks, setSoloedTracks] = useState(() => new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [audioLoadState, setAudioLoadState] = useState('loading')
  const [waveformPaths, setWaveformPaths] = useState(() => new Map())
  const positionRef = useRef(0)
  const startedAtRef = useRef(0)
  const playbackOffsetRef = useRef(0)
  const animationFrameRef = useRef(0)
  const timelineRulerRef = useRef(null)
  const isSeekingRef = useRef(false)
  const audioContextRef = useRef(null)
  const trackBuffersRef = useRef(new Map())
  const trackSourcesRef = useRef(new Map())
  const trackGainsRef = useRef(new Map())

  const trackIsInactive = (id, nextMutedTracks = mutedTracks, nextSoloedTracks = soloedTracks) => (
    nextMutedTracks.has(id) || (nextSoloedTracks.size > 0 && !nextSoloedTracks.has(id))
  )

  const applyTrackMix = (nextMutedTracks, nextSoloedTracks) => {
    const context = audioContextRef.current
    trackGainsRef.current.forEach((gain, id) => {
      rampGainImmediately(gain.gain, trackIsInactive(id, nextMutedTracks, nextSoloedTracks) ? 0 : 1, context)
    })
  }

  const toggleTrackState = (type, id) => {
    const current = type === 'mute' ? mutedTracks : soloedTracks
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    const nextMutedTracks = type === 'mute' ? next : mutedTracks
    const nextSoloedTracks = type === 'solo' ? next : soloedTracks
    applyTrackMix(nextMutedTracks, nextSoloedTracks)
    if (type === 'mute') setMutedTracks(next)
    else setSoloedTracks(next)
  }

  const stopTrackSources = () => {
    trackSourcesRef.current.forEach(source => {
      try { source.stop() } catch {}
      source.disconnect()
    })
    trackGainsRef.current.forEach(gain => gain.disconnect())
    trackSourcesRef.current.clear()
    trackGainsRef.current.clear()
  }

  const startTrackSources = () => {
    const context = audioContextRef.current
    if (!context || audioLoadState !== 'ready') return false

    isSeekingRef.current = false
    cancelAnimationFrame(animationFrameRef.current)
    stopTrackSources()
    const resumePromise = context.resume()
    const offset = positionRef.current % SYNTH_DRUM_DURATION
    const startsAt = context.currentTime
    synthDrumTracks.forEach(track => {
      const buffer = trackBuffersRef.current.get(track.id)
      if (!buffer) return
      const source = context.createBufferSource()
      const gain = context.createGain()
      const inactive = trackIsInactive(track.id)
      source.buffer = buffer
      source.loop = true
      source.loopEnd = SYNTH_DRUM_DURATION
      gain.gain.value = inactive ? 0 : 1
      source.connect(gain).connect(context.destination)
      source.start(startsAt, offset)
      trackSourcesRef.current.set(track.id, source)
      trackGainsRef.current.set(track.id, gain)
    })
    startedAtRef.current = startsAt
    playbackOffsetRef.current = offset
    resumePromise.catch(() => setIsPlaying(false))

    const updatePosition = () => {
      if (!isSeekingRef.current) {
        const nextPosition = audiblePlaybackPosition(
          context,
          startedAtRef.current,
          playbackOffsetRef.current,
          SYNTH_DRUM_DURATION,
        )
        positionRef.current = nextPosition
        setPosition(nextPosition)
      }
      animationFrameRef.current = requestAnimationFrame(updatePosition)
    }
    animationFrameRef.current = requestAnimationFrame(updatePosition)
    return true
  }

  useEffect(() => {
    let cancelled = false
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) {
      setAudioLoadState('error')
      return undefined
    }

    const context = new AudioContextClass({ latencyHint: 'interactive' })
    audioContextRef.current = context
    Promise.all(synthDrumTracks.map(async track => {
      const response = await fetch(track.src)
      if (!response.ok) throw new Error(`Unable to load ${track.label}`)
      const sourceBuffer = await context.decodeAudioData(await response.arrayBuffer())
      const paths = new Map(track.regions.map(region => [
        region.id,
        makeDrumWaveformPath(
          sourceBuffer,
          320,
          region.durationBeats * SYNTH_DRUM_BEAT_DURATION,
          region.sourceStartBeat * SYNTH_DRUM_BEAT_DURATION,
        ),
      ]))
      return {
        id: track.id,
        buffer: renderSynthDawTrack(context, sourceBuffer, track.regions),
        paths,
      }
    })).then(results => {
      if (cancelled) return
      results.forEach(result => trackBuffersRef.current.set(result.id, result.buffer))
      setWaveformPaths(new Map(results.map(result => [result.id, result.paths])))
      setAudioLoadState('ready')
    }).catch(() => {
      if (!cancelled) setAudioLoadState('error')
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(animationFrameRef.current)
      stopTrackSources()
      context.close().catch(() => {})
      audioContextRef.current = null
      document.documentElement.classList.remove('is-drum-seeking')
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animationFrameRef.current)
      stopTrackSources()
    }
  }, [isPlaying])

  useEffect(() => {
    const stopWhenAnotherSectionStarts = event => {
      if (event.detail?.sectionId !== 'synth-drum') setIsPlaying(false)
    }
    window.addEventListener(SYNTH_PLAYBACK_CHANGE_EVENT, stopWhenAnotherSectionStarts)
    return () => window.removeEventListener(SYNTH_PLAYBACK_CHANGE_EVENT, stopWhenAnotherSectionStarts)
  }, [])

  const togglePlayback = () => {
    if (audioLoadState !== 'ready') return
    if (isPlaying) {
      cancelAnimationFrame(animationFrameRef.current)
      stopTrackSources()
      setIsPlaying(false)
      return
    }
    announceSynthPlaybackStart('synth-drum')
    if (startTrackSources()) setIsPlaying(true)
  }

  const seekToClientX = clientX => {
    const ruler = timelineRulerRef.current
    if (!ruler) return
    const bounds = ruler.getBoundingClientRect()
    const progress = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width))
    const nextPosition = Math.min(SYNTH_DRUM_DURATION - .001, progress * SYNTH_DRUM_DURATION)
    positionRef.current = nextPosition
    setPosition(nextPosition)
  }

  const beginSeeking = event => {
    if (event.button !== 0) return
    const bounds = timelineRulerRef.current?.getBoundingClientRect()
    if (!bounds || event.clientX < bounds.left || event.clientX > bounds.right) return
    event.preventDefault()
    isSeekingRef.current = true
    document.documentElement.classList.add('is-drum-seeking')
    event.currentTarget.setPointerCapture(event.pointerId)
    seekToClientX(event.clientX)
  }

  const continueSeeking = event => {
    if (isSeekingRef.current) seekToClientX(event.clientX)
  }

  const finishSeeking = event => {
    if (!isSeekingRef.current) return
    if (event.type !== 'pointercancel') seekToClientX(event.clientX)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    document.documentElement.classList.remove('is-drum-seeking')
    if (isPlaying) {
      startTrackSources()
    } else {
      isSeekingRef.current = false
    }
  }

  const displayPosition = Math.min(position, SYNTH_DRUM_DURATION - .001)
  const currentBar = Math.min(SYNTH_DRUM_BARS, Math.floor(displayPosition / SYNTH_DRUM_BAR_DURATION) + 1)
  const currentBeat = Math.min(SYNTH_DRUM_BEATS, Math.floor((displayPosition % SYNTH_DRUM_BAR_DURATION) / (60 / SYNTH_DRUM_BPM)) + 1)
  const secondsLabel = `${Math.floor(position / 60).toString().padStart(2, '0')}:${Math.floor(position % 60).toString().padStart(2, '0')}`
  const playheadProgress = Math.min(100, position / SYNTH_DRUM_DURATION * 100)

  return <section className="synth-section synth-drum-section" id="synth-drum" aria-labelledby="synth-drum-title">
    <div className="synth-section-heading">
      <div><span>03 / SYNTH ARRANGEMENT</span><h2 id="synth-drum-title">Synth Layering</h2></div>
      <div className="synth-section-intro"><p>多个合成器的叠加丰富了主合成器的听感，使整体音色更饱满。在时间线上查看各合成器以及 Vocal 和其他乐器的编排方式，并自由开关试听。</p></div>
    </div>

    <div className="drum-daw">
      <div className="drum-transport">
        <button type="button" className="drum-play-button" data-synth-playback disabled={audioLoadState !== 'ready'} onClick={togglePlayback} aria-label={audioLoadState === 'loading' ? '音频加载中' : audioLoadState === 'error' ? '音频加载失败' : isPlaying ? '暂停 Synth Drum 时间线' : '播放 Synth Drum 时间线'}>
          {isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
        </button>
        <div className="drum-transport-status"><span>{audioLoadState === 'loading' ? 'LOADING AUDIO' : audioLoadState === 'error' ? 'AUDIO ERROR' : isPlaying ? 'PLAYING' : position > 0 ? 'PAUSED' : 'READY'}</span><strong>{secondsLabel}</strong></div>
        <div className="drum-position-readout"><span>BAR</span><strong>{currentBar}.{currentBeat}</strong></div>
        <div className="drum-session-stat"><span>TEMPO</span><strong>{SYNTH_DRUM_BPM}<small>BPM</small></strong></div>
        <div className="drum-session-stat"><span>METER</span><strong>4 / 4</strong></div>
        <div className="drum-session-stat"><span>LENGTH</span><strong>{SYNTH_DRUM_BARS}<small>BARS</small></strong></div>
      </div>

      <div className="drum-daw-scroll">
        <div
          className="drum-daw-grid synth-drum-grid"
          style={{ '--timeline-bars': SYNTH_DRUM_BARS, '--timeline-beats': SYNTH_DRUM_BARS * SYNTH_DRUM_BEATS }}
          onPointerDown={beginSeeking}
          onPointerMove={continueSeeking}
          onPointerUp={finishSeeking}
          onPointerCancel={finishSeeking}
        >
          <div className="drum-daw-corner"><span aria-hidden="true"></span><small>MUTE / SOLO</small></div>
          <div className="drum-ruler" ref={timelineRulerRef} aria-hidden="true">
            {Array.from({ length: SYNTH_DRUM_BARS }, (_, index) => <span key={index}>{index + 1}</span>)}
          </div>
          <div className="drum-playhead-layer" style={{ '--playhead-progress': `${playheadProgress}%` }} aria-hidden="true"><i></i><span></span></div>

          {synthDrumTracks.map(track => {
            const muted = mutedTracks.has(track.id)
            const soloed = soloedTracks.has(track.id)
            return <React.Fragment key={track.id}>
              <div className="drum-stack-label drum-standalone-label" style={{ '--stack-color': track.color }}>
                <div className="drum-stack-head">
                  <span className="drum-standalone-name">{track.label}</span>
                  <div className="drum-channel-actions">
                    <DrumLayeringMute label={track.label} muted={muted} onToggle={() => toggleTrackState('mute', track.id)} />
                    <DrumLayeringSolo label={track.label} soloed={soloed} onToggle={() => toggleTrackState('solo', track.id)} />
                  </div>
                </div>
              </div>
              <div className={`drum-stack-timeline drum-standalone-timeline${muted || (soloedTracks.size > 0 && !soloed) ? ' is-muted' : ''}`}>
                <div className="drum-track-lane synth-drum-track-lane">
                  {track.regions.map(region => <DrumWaveformClip
                    key={region.id}
                    color={track.color}
                    waveformPath={waveformPaths.get(track.id)?.get(region.id)}
                    startBeat={region.startBeat}
                    durationBeats={region.durationBeats}
                    timelineBars={SYNTH_DRUM_BARS}
                  />)}
                </div>
              </div>
            </React.Fragment>
          })}
        </div>
      </div>
    </div>
  </section>
}

function SynthDesignPage() {
  const prefersReducedMotion = useReducedMotion()
  const [activeLayerId, setActiveLayerId] = useState('osc-a')
  const [mutedLayers, setMutedLayers] = useState(() => new Set())
  const [soloLayers, setSoloLayers] = useState(() => new Set())
  const [layerParams] = useState(initialSynthParams)
  const [filter] = useState({ cutoff: SYNTH_FILTER_MIN_CUTOFF, resonance: 15, drive: 25, fat: 0, mix: 100 })
  const [filterEnabled, setFilterEnabled] = useState(true)
  const [filterRouting, setFilterRouting] = useState(() => new Set(synthFilterRoutes.map(route => route.id)))
  const [bypassedEnvelopeDestinations, setBypassedEnvelopeDestinations] = useState(() => new Set())
  const [hoveredEnvelopeDestination, setHoveredEnvelopeDestination] = useState(null)
  const envelope = { attack: 0.6, decay: 500, sustain: 20, release: 144 }
  const [delayEnabled, setDelayEnabled] = useState(true)
  const [lfoEnabled, setLfoEnabled] = useState(true)
  const [isLfoHovered, setIsLfoHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLayerPlaying, setIsLayerPlaying] = useState(false)
  const [layerAudioReady, setLayerAudioReady] = useState(false)
  const [delayAudioReady, setDelayAudioReady] = useState(false)
  const [layerPosition, setLayerPosition] = useState(0)
  const [layerDuration, setLayerDuration] = useState(0)
  const layerAudioContextRef = useRef(null)
  const layerBuffersRef = useRef({ withFilter: {}, withoutFilter: {}, withFilterBypassEnvelope: {} })
  const delayBuffersRef = useRef(new Map())
  const delaySourceRef = useRef(null)
  const delayGainRef = useRef(null)
  const layerSourcesRef = useRef(new Map())
  const layerGainsRef = useRef(new Map())
  const layerPlaybackOffsetRef = useRef(0)
  const layerPlaybackStartedAtRef = useRef(0)
  const delayPlaybackOffsetRef = useRef(0)
  const delayPlaybackStartedAtRef = useRef(0)
  const layerAnimationRef = useRef(0)
  const delayAnimationRef = useRef(0)
  const activeLayer = synthSoundLayers.find(layer => layer.id === activeLayerId) || synthSoundLayers[0]
  const activeParams = layerParams[activeLayer.id]

  const scrollToSynthSection = (event, sectionId) => {
    event.preventDefault()
    document.getElementById(sectionId)?.scrollIntoView({
      block: 'start',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  const scrollToSynthTop = event => {
    event.preventDefault()
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  const returnToArrangement = event => {
    event.preventDefault()
    try {
      sessionStorage.setItem(RETURN_TO_ARRANGEMENT_KEY, 'three-sixty')
    } catch {
      // The hash navigation still works when session storage is unavailable.
    }
    window.location.hash = 'works'
  }

  const stopLayerSources = () => {
    layerSourcesRef.current.forEach(source => {
      try { source.stop() } catch {}
      source.disconnect()
    })
    layerGainsRef.current.forEach(gain => gain.disconnect())
    layerSourcesRef.current.clear()
    layerGainsRef.current.clear()
  }

  const stopDelaySource = () => {
    if (delaySourceRef.current) {
      try { delaySourceRef.current.stop() } catch {}
      delaySourceRef.current.disconnect()
      delaySourceRef.current = null
    }
    delayGainRef.current?.disconnect()
    delayGainRef.current = null
  }

  const currentLayerPlaybackPosition = (context = layerAudioContextRef.current, playbackDuration = layerDuration) => (
    audiblePlaybackPosition(
      context,
      layerPlaybackStartedAtRef.current,
      layerPlaybackOffsetRef.current,
      playbackDuration,
    )
  )

  const layerIsInactive = (id, nextMutedLayers = mutedLayers, nextSoloLayers = soloLayers) => (
    nextMutedLayers.has(id) || (nextSoloLayers.size > 0 && !nextSoloLayers.has(id))
  )

  const applyLayerMix = (nextMutedLayers, nextSoloLayers) => {
    const context = layerAudioContextRef.current
    layerGainsRef.current.forEach((gain, id) => {
      rampGainImmediately(gain.gain, layerIsInactive(id, nextMutedLayers, nextSoloLayers) ? 0 : 1, context)
    })
  }

  const toggleLayerMix = (type, id) => {
    const current = type === 'mute' ? mutedLayers : soloLayers
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    const nextMutedLayers = type === 'mute' ? next : mutedLayers
    const nextSoloLayers = type === 'solo' ? next : soloLayers
    applyLayerMix(nextMutedLayers, nextSoloLayers)
    if (type === 'mute') setMutedLayers(next)
    else setSoloLayers(next)
  }

  const startLayerPlayback = (
    filterOn = filterEnabled,
    offset = layerPlaybackOffsetRef.current,
    routedLayers = filterRouting,
    bypassedDestinations = bypassedEnvelopeDestinations,
    preserveVisualClock = false,
  ) => {
    stopDelaySource()
    setIsPlaying(false)
    const context = layerAudioContextRef.current
    const selectedBuffers = synthSoundLayers.map(layer => {
      const usesFilter = filterOn && routedLayers.has(layer.id)
      const bankName = usesFilter && bypassedDestinations.has('filter-cutoff')
        ? 'withFilterBypassEnvelope'
        : usesFilter ? 'withFilter' : 'withoutFilter'
      const audioKey = layer.id === 'osc-a' && bypassedDestinations.has('osc-a-pwm')
        ? 'oscABypassEnvelope'
        : layer.id === 'osc-b' && bypassedDestinations.has('osc-b-wt-pos')
          ? 'oscBBypassEnvelope'
          : layer.audioKey
      return [layer, layerBuffersRef.current[bankName][audioKey]]
    })
    if (!context || !layerAudioReady || selectedBuffers.some(([, buffer]) => !buffer)) return
    announceSynthPlaybackStart('synth-tone')
    const resumePromise = context.resume()
    const previousSources = preserveVisualClock ? [...layerSourcesRef.current.values()] : []
    const previousGains = preserveVisualClock ? [...layerGainsRef.current.values()] : []
    if (preserveVisualClock) {
      layerSourcesRef.current.clear()
      layerGainsRef.current.clear()
    } else {
      stopLayerSources()
    }
    const safeDuration = Math.min(...selectedBuffers.map(([, buffer]) => buffer.duration))
    const safeOffset = safeDuration ? offset % safeDuration : 0
    const startsAt = context.currentTime
    if (preserveVisualClock) {
      previousGains.forEach(gain => {
        gain.gain.cancelScheduledValues(startsAt)
        gain.gain.setValueAtTime(gain.gain.value, startsAt)
        gain.gain.linearRampToValueAtTime(0, startsAt + LIVE_AUDIO_SWITCH_FADE)
      })
    }
    selectedBuffers.forEach(([layer, buffer]) => {
      const source = context.createBufferSource()
      const gain = context.createGain()
      const inactive = layerIsInactive(layer.id)
      const targetGain = inactive ? 0 : 1
      source.buffer = buffer
      source.loop = true
      source.loopEnd = safeDuration
      gain.gain.setValueAtTime(preserveVisualClock ? 0 : targetGain, startsAt)
      if (preserveVisualClock) gain.gain.linearRampToValueAtTime(targetGain, startsAt + LIVE_AUDIO_SWITCH_FADE)
      source.connect(gain).connect(context.destination)
      source.start(startsAt, safeOffset)
      layerSourcesRef.current.set(layer.id, source)
      layerGainsRef.current.set(layer.id, gain)
    })
    if (preserveVisualClock && previousSources.length) {
      window.setTimeout(() => {
        previousSources.forEach(source => {
          try { source.stop() } catch {}
          source.disconnect()
        })
        previousGains.forEach(gain => gain.disconnect())
      }, (LIVE_AUDIO_SWITCH_FADE * 1000) + 12)
    }
    if (!preserveVisualClock) {
      layerPlaybackOffsetRef.current = safeOffset
      layerPlaybackStartedAtRef.current = startsAt
      setLayerPosition(safeOffset)
    }
    setLayerDuration(safeDuration)
    setIsLayerPlaying(true)
    resumePromise.catch(() => setIsLayerPlaying(false))
  }

  const pauseLayerPlayback = () => {
    const context = layerAudioContextRef.current
    if (context && layerDuration) {
      layerPlaybackOffsetRef.current = currentLayerPlaybackPosition(context, layerDuration)
      setLayerPosition(layerPlaybackOffsetRef.current)
    }
    stopLayerSources()
    setIsLayerPlaying(false)
  }

  const delayAudioKey = (delayOn = delayEnabled, lfoOn = lfoEnabled) => (
    !delayOn ? 'withoutDelay' : lfoOn ? 'delayLfo' : 'delay'
  )

  const startDelayPlayback = (
    delayOn = delayEnabled,
    lfoOn = lfoEnabled,
    offset = delayPlaybackOffsetRef.current,
    preserveVisualClock = false,
  ) => {
    const context = layerAudioContextRef.current
    const buffer = delayBuffersRef.current.get(delayAudioKey(delayOn, lfoOn))
    if (!context || !delayAudioReady || !buffer) return false

    const resumePromise = context.resume()
    const previousSource = preserveVisualClock ? delaySourceRef.current : null
    const previousGain = preserveVisualClock ? delayGainRef.current : null
    if (!preserveVisualClock) stopDelaySource()
    const safeOffset = buffer.duration ? offset % buffer.duration : 0
    const startsAt = context.currentTime
    const source = context.createBufferSource()
    const gain = context.createGain()
    source.buffer = buffer
    source.loop = true
    source.loopEnd = buffer.duration
    gain.gain.setValueAtTime(preserveVisualClock ? 0 : 1, startsAt)
    if (preserveVisualClock) gain.gain.linearRampToValueAtTime(1, startsAt + LIVE_AUDIO_SWITCH_FADE)
    if (previousGain) {
      previousGain.gain.cancelScheduledValues(startsAt)
      previousGain.gain.setValueAtTime(previousGain.gain.value, startsAt)
      previousGain.gain.linearRampToValueAtTime(0, startsAt + LIVE_AUDIO_SWITCH_FADE)
    }
    source.connect(gain).connect(context.destination)
    source.start(startsAt, safeOffset)
    delaySourceRef.current = source
    delayGainRef.current = gain
    if (previousSource) {
      window.setTimeout(() => {
        try { previousSource.stop() } catch {}
        previousSource.disconnect()
        previousGain?.disconnect()
      }, (LIVE_AUDIO_SWITCH_FADE * 1000) + 12)
    }

    if (!preserveVisualClock) {
      delayPlaybackOffsetRef.current = safeOffset
      delayPlaybackStartedAtRef.current = startsAt
      setPosition(safeOffset)
    }
    setDuration(buffer.duration)
    setIsPlaying(true)
    resumePromise.catch(() => setIsPlaying(false))
    return true
  }

  const pauseDelayPlayback = () => {
    const context = layerAudioContextRef.current
    if (context && duration) {
      const audiblePosition = audiblePlaybackPosition(
        context,
        delayPlaybackStartedAtRef.current,
        delayPlaybackOffsetRef.current,
        duration,
      )
      setPosition(audiblePosition)
      delayPlaybackOffsetRef.current = audiblePosition
    }
    stopDelaySource()
    setIsPlaying(false)
  }

  useEffect(() => {
    if (!isPlaying) stopDelaySource()
  }, [isPlaying])

  useEffect(() => {
    if (!isPlaying) return undefined
    const updatePosition = () => {
      const context = layerAudioContextRef.current
      if (context && duration) {
        setPosition(audiblePlaybackPosition(
          context,
          delayPlaybackStartedAtRef.current,
          delayPlaybackOffsetRef.current,
          duration,
        ))
      }
      delayAnimationRef.current = requestAnimationFrame(updatePosition)
    }
    delayAnimationRef.current = requestAnimationFrame(updatePosition)
    return () => cancelAnimationFrame(delayAnimationRef.current)
  }, [isPlaying, duration])

  useEffect(() => {
    let cancelled = false
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return undefined
    const context = new AudioContextClass({ latencyHint: 'interactive' })
    layerAudioContextRef.current = context
    const layerRequests = Object.entries(synthLayerAudio).flatMap(([bankName, bank]) =>
      Object.entries(bank).map(async ([audioKey, url]) => {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Unable to load ${audioKey}`)
        const buffer = await context.decodeAudioData(await response.arrayBuffer())
        return { bankName, audioKey, buffer }
      })
    )
    const delayRequests = Object.entries(synthDelayAudioSources).map(async ([audioKey, url]) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Unable to load ${audioKey}`)
      const buffer = await context.decodeAudioData(await response.arrayBuffer())
      return { audioKey, buffer }
    })
    Promise.all([Promise.all(layerRequests), Promise.all(delayRequests)]).then(([results, delayResults]) => {
      if (cancelled) return
      results.forEach(({ bankName, audioKey, buffer }) => { layerBuffersRef.current[bankName][audioKey] = buffer })
      delayResults.forEach(({ audioKey, buffer }) => delayBuffersRef.current.set(audioKey, buffer))
      setLayerDuration(Math.min(...results.map(result => result.buffer.duration)))
      setLayerAudioReady(true)
      setDelayAudioReady(true)
    }).catch(() => {
      if (!cancelled) {
        setLayerAudioReady(false)
        setDelayAudioReady(false)
      }
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(layerAnimationRef.current)
      stopLayerSources()
      stopDelaySource()
      delayBuffersRef.current.clear()
      context.close().catch(() => {})
      layerAudioContextRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isLayerPlaying) return undefined
    const updatePosition = () => {
      const context = layerAudioContextRef.current
      if (context && layerDuration) setLayerPosition(currentLayerPlaybackPosition(context, layerDuration))
      layerAnimationRef.current = requestAnimationFrame(updatePosition)
    }
    layerAnimationRef.current = requestAnimationFrame(updatePosition)
    return () => cancelAnimationFrame(layerAnimationRef.current)
  }, [isLayerPlaying, layerDuration])

  useEffect(() => {
    const handleSpace = event => {
      if (event.code !== 'Space' || event.repeat) return
      const target = event.target
      if (target instanceof HTMLElement && (
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      )) return
      event.preventDefault()
      event.stopPropagation()

      const viewportCenter = window.innerHeight / 2
      const sections = ['synth-tone', 'delay-fx', 'synth-drum']
        .map(id => document.getElementById(id))
        .filter(Boolean)
      const currentSection = sections.find(section => {
        const bounds = section.getBoundingClientRect()
        return bounds.top <= viewportCenter && bounds.bottom >= viewportCenter
      }) || sections.reduce((closest, section) => {
        if (!closest) return section
        const sectionBounds = section.getBoundingClientRect()
        const closestBounds = closest.getBoundingClientRect()
        const sectionDistance = Math.abs((sectionBounds.top + sectionBounds.bottom) / 2 - viewportCenter)
        const closestDistance = Math.abs((closestBounds.top + closestBounds.bottom) / 2 - viewportCenter)
        return sectionDistance < closestDistance ? section : closest
      }, null)

      const playbackButton = currentSection?.querySelector('[data-synth-playback]')
      if (!playbackButton) return
      playbackButton.click()
    }
    window.addEventListener('keydown', handleSpace, true)
    return () => window.removeEventListener('keydown', handleSpace, true)
  }, [])

  useEffect(() => {
    const stopWhenSynthLayeringStarts = event => {
      if (event.detail?.sectionId !== 'synth-drum') return
      if (isLayerPlaying) pauseLayerPlayback()
      setIsPlaying(false)
    }
    window.addEventListener(SYNTH_PLAYBACK_CHANGE_EVENT, stopWhenSynthLayeringStarts)
    return () => window.removeEventListener(SYNTH_PLAYBACK_CHANGE_EVENT, stopWhenSynthLayeringStarts)
  }, [isLayerPlaying, layerDuration])

  const toggleFilter = () => {
    const nextEnabled = !filterEnabled
    const context = layerAudioContextRef.current
    const offset = isLayerPlaying && context && layerDuration
      ? renderedPlaybackPosition(context, layerPlaybackStartedAtRef.current, layerPlaybackOffsetRef.current, layerDuration)
      : layerPlaybackOffsetRef.current
    setFilterEnabled(nextEnabled)
    if (isLayerPlaying) startLayerPlayback(nextEnabled, offset, filterRouting, bypassedEnvelopeDestinations, true)
  }

  const toggleFilterRoute = id => {
    const nextRouting = new Set(filterRouting)
    if (nextRouting.has(id)) nextRouting.delete(id)
    else nextRouting.add(id)
    setFilterRouting(nextRouting)
    if (!isLayerPlaying || !filterEnabled) return
    const context = layerAudioContextRef.current
    const offset = context && layerDuration
      ? renderedPlaybackPosition(context, layerPlaybackStartedAtRef.current, layerPlaybackOffsetRef.current, layerDuration)
      : layerPlaybackOffsetRef.current
    startLayerPlayback(true, offset, nextRouting, bypassedEnvelopeDestinations, true)
  }

  const toggleAllFilterRoutes = () => {
    const allSelected = synthFilterRoutes.every(route => filterRouting.has(route.id))
    const nextRouting = allSelected
      ? new Set()
      : new Set(synthFilterRoutes.map(route => route.id))
    setFilterRouting(nextRouting)
    if (!isLayerPlaying || !filterEnabled) return
    const context = layerAudioContextRef.current
    const offset = context && layerDuration
      ? renderedPlaybackPosition(context, layerPlaybackStartedAtRef.current, layerPlaybackOffsetRef.current, layerDuration)
      : layerPlaybackOffsetRef.current
    startLayerPlayback(true, offset, nextRouting, bypassedEnvelopeDestinations, true)
  }

  const toggleEnvelopeBypass = id => {
    const next = new Set(bypassedEnvelopeDestinations)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setBypassedEnvelopeDestinations(next)
    if (isLayerPlaying) {
      const context = layerAudioContextRef.current
      const offset = context && layerDuration
        ? renderedPlaybackPosition(context, layerPlaybackStartedAtRef.current, layerPlaybackOffsetRef.current, layerDuration)
        : layerPlaybackOffsetRef.current
      startLayerPlayback(filterEnabled, offset, filterRouting, next, true)
    }
  }

  const resetSynthTone = () => {
    const defaultRouting = new Set(synthFilterRoutes.map(route => route.id))
    const emptySet = new Set()
    const context = layerAudioContextRef.current
    const offset = isLayerPlaying && context && layerDuration
      ? renderedPlaybackPosition(context, layerPlaybackStartedAtRef.current, layerPlaybackOffsetRef.current, layerDuration)
      : layerPlaybackOffsetRef.current

    setMutedLayers(emptySet)
    setSoloLayers(new Set())
    setFilterEnabled(true)
    setFilterRouting(defaultRouting)
    setBypassedEnvelopeDestinations(new Set())
    setHoveredEnvelopeDestination(null)

    if (isLayerPlaying) startLayerPlayback(true, offset, defaultRouting, new Set(), true)
    applyLayerMix(new Set(), new Set())
  }

  const switchDelayAudio = (nextDelayEnabled, nextLfoEnabled) => {
    const context = layerAudioContextRef.current
    const nextBuffer = delayBuffersRef.current.get(delayAudioKey(nextDelayEnabled, nextLfoEnabled))
    if (!nextBuffer) return
    if (isPlaying && context && duration) {
      const renderPosition = renderedPlaybackPosition(
        context,
        delayPlaybackStartedAtRef.current,
        delayPlaybackOffsetRef.current,
        duration,
      )
      startDelayPlayback(nextDelayEnabled, nextLfoEnabled, renderPosition, true)
      return
    }
    const nextPosition = Math.min(position, Math.max(0, nextBuffer.duration - .001))
    delayPlaybackOffsetRef.current = nextPosition
    setPosition(nextPosition)
    setDuration(nextBuffer.duration)
  }

  const toggleDelay = () => {
    const nextEnabled = !delayEnabled
    setDelayEnabled(nextEnabled)
    switchDelayAudio(nextEnabled, lfoEnabled)
  }

  const toggleDelayLfo = () => {
    const nextEnabled = !lfoEnabled
    setLfoEnabled(nextEnabled)
    if (delayEnabled) switchDelayAudio(true, nextEnabled)
  }

  const resetDelayFx = () => {
    setDelayEnabled(true)
    setLfoEnabled(true)
    setIsLfoHovered(false)
    switchDelayAudio(true, true)
  }

  const synthDisplayPosition = Math.min(layerPosition, SYNTH_LAYER_DURATION - .001)
  const synthCurrentBar = Math.min(SYNTH_LAYER_BARS, Math.floor(synthDisplayPosition / SYNTH_LAYER_BAR_DURATION) + 1)
  const synthCurrentBeat = Math.min(SYNTH_LAYER_BEATS, Math.floor((synthDisplayPosition % SYNTH_LAYER_BAR_DURATION) / (60 / SYNTH_LAYER_BPM)) + 1)
  const synthSecondsLabel = `${Math.floor(layerPosition / 60).toString().padStart(2, '0')}:${Math.floor(layerPosition % 60).toString().padStart(2, '0')}`
  const delayTimelinePosition = Math.min(position, SYNTH_LAYER_DURATION - .001)
  const delayLfoPhase = (delayTimelinePosition % SYNTH_LAYER_BAR_DURATION) / SYNTH_LAYER_BAR_DURATION
  const delayWetLevel = delayEnabled ? (lfoEnabled ? delayLfoLevelAt(delayLfoPhase) : 1) : 0
  const displayedDelayWet = Math.round(delayWetLevel * 31)
  const delayCurrentBar = Math.min(SYNTH_LAYER_BARS, Math.floor(delayTimelinePosition / SYNTH_LAYER_BAR_DURATION) + 1)
  const delayCurrentBeat = Math.min(SYNTH_LAYER_BEATS, Math.floor((delayTimelinePosition % SYNTH_LAYER_BAR_DURATION) / (60 / SYNTH_LAYER_BPM)) + 1)
  const delaySecondsLabel = `${Math.floor(position / 60).toString().padStart(2, '0')}:${Math.floor(position % 60).toString().padStart(2, '0')}`
  const delayBeatDuration = 60 / SYNTH_LAYER_BPM
  const delayTapPulseDuration = Math.min(SYNTH_LAYER_SIXTEENTH_DURATION * .7, .12)
  const activeDelayTaps = isPlaying && delayEnabled
    ? DELAY_TAPS.map(tap => SYNTH_FILTER_TRIGGER_TIMES.some(triggerTime => {
      const tapTime = triggerTime + (tap.beat - DELAY_TAPS[0].beat) * delayBeatDuration
      const elapsed = delayTimelinePosition - tapTime
      return elapsed >= 0 && elapsed < delayTapPulseDuration
    }))
    : DELAY_TAPS.map(() => false)

  const waveformAmount = activeLayer.waveformAmount
  const envelopeTiming = synthEnvelopeTimingAt(layerPosition)
  const synthEnvelopeLevel = isLayerPlaying && !prefersReducedMotion
    ? synthEnvelopeLevelAt(layerPosition, envelope)
    : 0
  const envelopeDotDuration = Math.min(
    SYNTH_LAYER_SIXTEENTH_DURATION + envelope.release / 1000,
    envelopeTiming.triggerInterval * .9,
  )
  const envelopeDotVisible = isLayerPlaying && !prefersReducedMotion && envelopeTiming.elapsed <= envelopeDotDuration
  const envelopeDotPoint = synthEnvelopePointAt(envelopeTiming.elapsed / envelopeDotDuration)
  const filterEnvelopeLevel = !bypassedEnvelopeDestinations.has('filter-cutoff')
    ? synthEnvelopeLevel
    : 0
  const waveformMorphAmount = (
    (activeLayer.id === 'osc-a' && !bypassedEnvelopeDestinations.has('osc-a-pwm'))
    || (activeLayer.id === 'osc-b' && !bypassedEnvelopeDestinations.has('osc-b-wt-pos'))
  ) ? synthEnvelopeLevel : 0
  const animatedFilterCutoff = Math.round(
    SYNTH_FILTER_MIN_CUTOFF * Math.pow(SYNTH_FILTER_MAX_CUTOFF / SYNTH_FILTER_MIN_CUTOFF, filterEnvelopeLevel)
  )
  const displayedFilterCutoff = bypassedEnvelopeDestinations.has('filter-cutoff')
    ? filter.cutoff
    : animatedFilterCutoff
  const displayedSynthParamValue = param => {
    if (!isLayerPlaying) return activeParams[param.id]
    if (activeLayer.id === 'osc-a' && param.id === 'pwm' && !bypassedEnvelopeDestinations.has('osc-a-pwm')) {
      return Math.round(73 - synthEnvelopeLevel * 3)
    }
    if (activeLayer.id === 'osc-b' && param.id === 'position' && !bypassedEnvelopeDestinations.has('osc-b-wt-pos')) {
      return Math.round(256 - synthEnvelopeLevel * 14)
    }
    return activeParams[param.id]
  }
  const cutoffProgress = (Math.log10(animatedFilterCutoff) - Math.log10(120)) / (Math.log10(18000) - Math.log10(120))
  const filterKneeX = 74 + cutoffProgress * 270
  const filterPath = [
    'M 0 94',
    `C ${Math.max(18, filterKneeX - 112)} 94 ${Math.max(48, filterKneeX - 68)} 94 ${filterKneeX - 42} 94`,
    `C ${filterKneeX - 28} 94 ${filterKneeX - 18} 90 ${filterKneeX} 90`,
    `C ${filterKneeX + 28} 90 ${filterKneeX + 60} 124 ${filterKneeX + 92} 171`,
    `C ${filterKneeX + 126} 221 ${filterKneeX + 180} 300 520 430`,
  ].join(' ')
  const envelopeNodes = [
    { id: 'attack', x: 72, y: 30 },
    { id: 'decay', x: 276, y: 112 },
    { id: 'sustain', x: 506, y: 112 },
    { id: 'release', x: 694, y: 176 },
  ]
  const envelopePath = [
    'M 18 176',
    'C 37 168 50 79 72 30',
    'C 104 40 190 105 276 112',
    'C 350 112 430 112 506 112',
    'C 570 112 620 145 694 176',
  ].join(' ')
  const inactiveLayer = id => layerIsInactive(id)

  return <section className="synth-design-detail" aria-labelledby="synth-design-title">
    <header className="synth-design-hero">
      <div className="synth-detail-nav">
        <a href="#works" onClick={returnToArrangement}><ChevronLeft size={18} /> 返回</a>
        <nav aria-label="Synth Design 页面章节">
          <a href="#synth-tone" onClick={event => scrollToSynthSection(event, 'synth-tone')}>合成器音色</a>
          <a href="#delay-fx" onClick={event => scrollToSynthSection(event, 'delay-fx')}>Delay 效果器</a>
          <a href="#synth-drum" onClick={event => scrollToSynthSection(event, 'synth-drum')}>Synth Layering</a>
        </nav>
      </div>
      <div className="synth-hero-grid">
        <div>
          <p className="synth-kicker">360 · CHARLI XCX</p>
          <h1 id="synth-design-title">Synth Design<span>.</span></h1>
        </div>
        <p>从波形、滤波、动态调制到效果器，赋予音色弹性与张力，还原《360》极具辨识度的代表性合成器。</p>
      </div>
    </header>

    <section className="synth-section" id="synth-tone" aria-labelledby="synth-tone-title">
      <div className="synth-section-heading">
        <div><span>01 / SYNTHESIZER</span><h2 id="synth-tone-title">合成器音色</h2></div>
        <div className="synth-section-intro">
          <p>以方波为基底构造《360》标志性音色。点选一层查看它的固定波形与参数；开关滤波器和 Envelope 控制来查看它们对音色的影响。</p>
        </div>
      </div>

      <div className="synth-workbench-frame">
        <div className="synth-transport">
          <button
            type="button"
            className="synth-transport-play"
            data-synth-playback
            disabled={!layerAudioReady}
            onClick={() => isLayerPlaying ? pauseLayerPlayback() : startLayerPlayback()}
            aria-label={!layerAudioReady ? '合成器分层音频加载中' : isLayerPlaying ? '暂停合成器音色分层' : '播放合成器音色分层'}
          >{isLayerPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}</button>
          <div className="synth-transport-status"><span>{!layerAudioReady ? 'LOADING AUDIO' : isLayerPlaying ? 'PLAYING' : layerPosition > 0 ? 'PAUSED' : 'READY'}</span><strong>{synthSecondsLabel}</strong></div>
          <button type="button" className="synth-reset-button" onClick={resetSynthTone} aria-label="恢复合成器音色的默认设置" title="Reset"><RotateCcw size={16} /><span>RESET</span></button>
          <div className="synth-position-readout"><span>BAR</span><strong>{synthCurrentBar}.{synthCurrentBeat}</strong></div>
          <div className="synth-session-stat"><span>TEMPO</span><strong>{SYNTH_LAYER_BPM}<small>BPM</small></strong></div>
          <div className="synth-session-stat"><span>METER</span><strong>4 / 4</strong></div>
          <div className="synth-session-stat"><span>LENGTH</span><strong>{SYNTH_LAYER_BARS}<small>BARS</small></strong></div>
        </div>

        <div className="synth-workbench">
        <aside className="synth-layers" aria-label="声音层">
          <div className="synth-panel-title"><span>SOUND LAYERS</span><small>选择声音层 (振荡器)</small></div>
          <div className="synth-layer-list">
            {synthSoundLayers.map(layer => <button
              type="button"
              key={layer.id}
              className={`synth-layer${activeLayer.id === layer.id ? ' is-active' : ''}${inactiveLayer(layer.id) ? ' is-inactive' : ''}`}
              onClick={() => setActiveLayerId(layer.id)}
              aria-pressed={activeLayer.id === layer.id}
            >
              <span className="synth-layer-head"><b>{layer.no}</b><strong>{layer.name}</strong><i>{layer.source}</i></span>
              <span
                className="synth-layer-image"
                style={{ '--synth-layer-image': `url("${layer.image}")` }}
                aria-hidden="true"
              />
              <span className="synth-layer-foot"><small>{layer.description}</small><span className="synth-layer-actions">
                <span role="button" tabIndex="0" aria-label={`${mutedLayers.has(layer.id) ? '取消静音' : '静音'} ${layer.name}`} aria-pressed={mutedLayers.has(layer.id)} className={`synth-layer-mute${mutedLayers.has(layer.id) ? ' is-on' : ''}`} onClick={event => { event.stopPropagation(); toggleLayerMix('mute', layer.id) }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); toggleLayerMix('mute', layer.id) } }}>M</span>
                <span role="button" tabIndex="0" aria-label={`${soloLayers.has(layer.id) ? '取消独奏' : '独奏'} ${layer.name}`} aria-pressed={soloLayers.has(layer.id)} className={`synth-layer-solo${soloLayers.has(layer.id) ? ' is-on' : ''}`} onClick={event => { event.stopPropagation(); toggleLayerMix('solo', layer.id) }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); toggleLayerMix('solo', layer.id) } }}>S</span>
              </span></span>
            </button>)}
          </div>
        </aside>

        <div className="synth-oscillator-panel">
          <div className="synth-panel-title"><span>{activeLayer.source} / {activeLayer.name}</span><small>波形图</small></div>
          <div className="synth-wave-display">
            <svg viewBox="0 0 720 260" preserveAspectRatio="none" aria-label={`${activeLayer.name} 波形`}>
              <defs><linearGradient id="synth-wave-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d8ff45" stopOpacity=".38"/><stop offset="1" stopColor="#d8ff45" stopOpacity="0"/></linearGradient></defs>
              <path className="synth-wave-area" d={`${synthWavePath(activeLayer.type, waveformAmount, waveformMorphAmount)} L 720 260 L 0 260 Z`} />
              <path className="synth-wave-main" d={synthWavePath(activeLayer.type, waveformAmount, waveformMorphAmount)} />
            </svg>
            <span className="synth-wave-hint">{activeLayer.wavetable}</span>
          </div>
          <div
            className={`synth-param-grid${activeLayer.params.length < 4 ? ' is-centered' : ''}`}
            style={{ '--synth-param-count': activeLayer.params.length }}
          >
            {activeLayer.params.map(param => {
              const envelopeDestination = activeLayer.id === 'osc-a' && param.id === 'pwm'
                ? 'osc-a-pwm'
                : activeLayer.id === 'osc-b' && param.id === 'position'
                  ? 'osc-b-wt-pos'
                  : null
              return <SynthRange
                key={param.id}
                {...param}
                value={displayedSynthParamValue(param)}
                highlighted={Boolean(envelopeDestination && hoveredEnvelopeDestination === envelopeDestination)}
              />
            })}
          </div>
        </div>

        <aside className="synth-filter-panel">
          <div className="synth-panel-title synth-panel-title-row">
            <span><b>FILTER</b><small>滤波器</small></span>
            <button type="button" className="synth-filter-toggle" aria-pressed={filterEnabled} onClick={toggleFilter}>
              <span>{filterEnabled ? 'ON' : 'OFF'}</span><i />
            </button>
          </div>
          <div
            className={`synth-filter-curve${filterEnabled ? '' : ' is-off'}${filterEnvelopeLevel > 0 ? ' is-sweeping' : ''}`}
            style={{ '--filter-envelope-level': filterEnvelopeLevel }}
          >
            <svg viewBox="0 0 520 210" preserveAspectRatio="none" aria-label={`滤波器曲线，当前截止频率 ${animatedFilterCutoff} Hz`}>
              <path className="synth-filter-fill" d={`${filterPath} L 520 102 L 0 102 Z`} />
              <path className="synth-filter-line" d={filterPath} />
            </svg>
            <span className="synth-wave-hint">MG Low 24</span>
            <span className={`synth-filter-cutoff${hoveredEnvelopeDestination === 'filter-cutoff' ? ' is-envelope-highlighted' : ''}`}><b>{displayedFilterCutoff} Hz</b><small>CUTOFF</small></span>
          </div>
          <div className={`synth-filter-routing${filterEnabled ? '' : ' is-disabled'}`}>
            <span><b>FILTER ROUTING</b><small>选择应用 Filter 的振荡器</small></span>
            <div role="group" aria-label="Filter 声源路由">
              {synthFilterRoutes.map(route => <button
                type="button"
                key={route.id}
                className={filterRouting.has(route.id) ? 'is-active' : ''}
                aria-label={`${filterRouting.has(route.id) ? '从' : '将'} ${route.name} ${filterRouting.has(route.id) ? '移出 Filter' : '加入 Filter'}`}
                aria-pressed={filterRouting.has(route.id)}
                onClick={() => toggleFilterRoute(route.id)}
              >{route.label}</button>)}
              <button
                type="button"
                className={`synth-filter-route-all${synthFilterRoutes.every(route => filterRouting.has(route.id)) ? ' is-active' : ''}`}
                aria-label={synthFilterRoutes.every(route => filterRouting.has(route.id)) ? '取消选择全部 Filter 声源' : '选择全部 Filter 声源'}
                aria-pressed={synthFilterRoutes.every(route => filterRouting.has(route.id))}
                onClick={toggleAllFilterRoutes}
              >ALL</button>
            </div>
          </div>
          <div className="synth-filter-controls">
            <SynthRange label="RESONANCE" value={filter.resonance} disabled={!filterEnabled} />
            <SynthRange label="DRIVE" value={filter.drive} disabled={!filterEnabled} />
            <SynthRange label="FAT" value={filter.fat} disabled={!filterEnabled} />
            <SynthRange label="MIX" value={filter.mix} disabled={!filterEnabled} />
          </div>
        </aside>

        <div className="synth-envelope-panel">
          <div className="synth-panel-title"><span>ENVELOPE</span><small>包络曲线</small></div>
          <div className="synth-envelope-curve">
            <svg viewBox="0 0 720 200" preserveAspectRatio="none" aria-label="Envelope 曲线">
              <defs>
                <linearGradient id="synth-envelope-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#d8ff45" stopOpacity=".24" />
                  <stop offset=".72" stopColor="#d8ff45" stopOpacity=".07" />
                  <stop offset="1" stopColor="#d8ff45" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path className="synth-envelope-area" d={`${envelopePath} L 694 184 L 18 184 Z`} />
              {envelopeNodes.map(node => <line key={`${node.id}-guide`} x1={node.x} y1={node.y} x2={node.x} y2="184" />)}
              <path className="synth-envelope-line" d={envelopePath} />
              {envelopeNodes.map(node => <circle key={node.id} cx={node.x} cy={node.y} r="7" />)}
              {envelopeDotVisible && <circle
                className="synth-envelope-progress"
                cx={envelopeDotPoint.x}
                cy={envelopeDotPoint.y}
                r="4.5"
                aria-hidden="true"
              />}
            </svg>
          </div>
          <div className="synth-envelope-controls">
            <SynthRange label="ATTACK" value={envelope.attack} unit=" ms" />
            <SynthRange label="DECAY" value={envelope.decay} unit=" ms" />
            <SynthRange label="SUSTAIN" value={envelope.sustain} />
            <SynthRange label="RELEASE" value={envelope.release} unit=" ms" />
          </div>
        </div>

        <aside className="synth-matrix-panel">
          <div className="synth-panel-title"><span>ENVELOPE MATRIX</span><small>包络控制目标</small></div>
          <div className="synth-matrix-list">
            {synthMatrixRows.map((row, index) => {
              const isBypassed = bypassedEnvelopeDestinations.has(row.id)
              return <div
                className={`synth-matrix-row${isBypassed ? ' is-bypassed' : ''}`}
                key={row.id}
                onMouseEnter={() => { if (row.bypassable) setHoveredEnvelopeDestination(row.id) }}
                onMouseLeave={() => { if (row.bypassable) setHoveredEnvelopeDestination(null) }}
              >
              <span className="synth-matrix-no">0{index + 1}</span>
              <span className="synth-matrix-destination"><b>{row.destination}</b><small>{row.detail}</small></span>
              <span className="synth-matrix-data">
                <strong className="synth-matrix-value">{row.value}</strong>
                <em className="synth-matrix-percent">({row.percent})</em>
                {row.bypassable ? <button
                  type="button"
                  className="synth-matrix-bypass"
                  aria-label={`${isBypassed ? '恢复' : '跳过'} Envelope 对 ${row.destination} 的控制`}
                  aria-pressed={isBypassed}
                  onClick={() => toggleEnvelopeBypass(row.id)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6.265 3.807 1.147 1.639a8 8 0 1 0 9.176 0l1.147-1.639A9.99 9.99 0 0 1 22 12c0 5.523-4.477 10-10 10S2 17.523 2 12a9.99 9.99 0 0 1 4.265-8.193M11 12V2h2v10z" />
                  </svg>
                  <span>跳过</span>
                </button> : <span aria-hidden="true" />}
              </span>
            </div>
            })}
          </div>
        </aside>
        </div>
      </div>
    </section>

    <section className="synth-section synth-delay-section" id="delay-fx" aria-labelledby="delay-fx-title">
      <div className="synth-section-heading">
        <div><span>02 / DELAY EFFECT</span><h2 id="delay-fx-title">Delay 效果器</h2></div>
        <div className="synth-section-intro"><p>用短促的 Delay 延展合成器尾音，并通过 LFO 动态控制湿声比例，让 Delay 只在句尾浮现，为音色增加空间感与流动感。</p></div>
      </div>
      <div className="synth-delay-frame">
        <div className="synth-transport synth-delay-transport">
          <button type="button" className="synth-transport-play" data-synth-playback disabled={!delayAudioReady} onClick={() => {
            if (isPlaying) {
              pauseDelayPlayback()
              return
            }
            announceSynthPlaybackStart('delay-fx')
            if (isLayerPlaying) pauseLayerPlayback()
            startDelayPlayback()
          }} aria-label={!delayAudioReady ? 'Delay FX 音频加载中' : isPlaying ? '暂停 Delay FX 试听' : '播放 Delay FX 试听'}>
            {isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
          </button>
          <div className="synth-transport-status"><span>{!delayAudioReady ? 'LOADING AUDIO' : isPlaying ? 'PLAYING' : position > 0 ? 'PAUSED' : 'READY'}</span><strong>{delaySecondsLabel}</strong></div>
          <button type="button" className="synth-reset-button" onClick={resetDelayFx} aria-label="恢复 Delay 效果器的默认设置" title="Reset"><RotateCcw size={16} /><span>RESET</span></button>
          <div className="synth-position-readout"><span>BAR</span><strong>{delayCurrentBar}.{delayCurrentBeat}</strong></div>
          <div className="synth-session-stat"><span>TEMPO</span><strong>{SYNTH_LAYER_BPM}<small>BPM</small></strong></div>
          <div className="synth-session-stat"><span>METER</span><strong>4 / 4</strong></div>
          <div className="synth-session-stat"><span>LENGTH</span><strong>{SYNTH_LAYER_BARS}<small>BARS</small></strong></div>
        </div>
        <div className="synth-delay-board">
          <div className={`delay-visual-panel${delayEnabled ? '' : ' is-off'}`}>
            <div className="synth-panel-title synth-panel-title-row">
              <span><b>DELAY SIGNAL PATH</b><small>Delay 信号示意</small></span>
              <button type="button" className="synth-filter-toggle" aria-pressed={delayEnabled} onClick={toggleDelay}>
                <span>{delayEnabled ? 'ON' : 'OFF'}</span><i />
              </button>
            </div>
            <div className="delay-echo-visual is-stereo">
              <div className="delay-source"><span>DRY</span><b>SYNTH</b></div>
              <div className="delay-path-line"></div>
              <div className="delay-taps">
                {DELAY_TAPS.map((tap, index) => {
                  const amplitudeBrightness = Math.max(0, Math.min(1, 1 + tap.db / 70))
                  const wetContrast = delayWetLevel * delayWetLevel * (3 - 2 * delayWetLevel)
                  const wetBrightness = .03 + wetContrast * .97
                  const brightness = amplitudeBrightness * wetBrightness
                  const brightnessPercent = (brightness * 100).toFixed(2)
                  return <span
                    className={`delay-tap${activeDelayTaps[index] ? ' is-active' : ''}`}
                    key={tap.beat}
                    style={{
                      '--tap-index': index,
                      '--tap-intensity': brightness,
                      '--tap-glow-size': `${12 + brightness * 26}px`,
                      '--tap-active-bg': `color-mix(in srgb, #181916, var(--synth-accent) ${brightnessPercent}%)`,
                      '--tap-active-border': `color-mix(in srgb, #4c4f48, var(--synth-accent) ${brightnessPercent}%)`,
                      '--tap-active-color': `color-mix(in srgb, #85887f, #111210 ${brightnessPercent}%)`,
                    }}
                    aria-label={`Delay ${index + 1}，${tap.beat} 拍，振幅 ${Number((tap.amplitude * 100).toFixed(2))}%，${tap.db} dB，当前 Wet ${displayedDelayWet}%`}
                  >{index + 1}</span>
                })}
              </div>
              <div className="delay-output"><span>WET</span><b>L / R</b></div>
            </div>
            <div className="delay-controls-panel">
              <div className="synth-panel-title"><span>DELAY CONTROLS</span><small>Delay 效果参数控制</small></div>
              <div className="delay-controls-content">
                <div className="delay-filter-curve" aria-label="Delay 滤波器曲线">
                  <svg viewBox="0 0 320 114" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="delay-filter-fill-green" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#d8ff45" stopOpacity=".3" />
                        <stop offset="1" stopColor="#d8ff45" stopOpacity=".08" />
                      </linearGradient>
                    </defs>
                    <path className="delay-filter-area" d="M 8 58 C 56 43 248 43 312 64 L 312 114 L 8 114 Z" />
                    <path className="delay-filter-line" d="M 8 58 C 56 43 248 43 312 64" />
                  </svg>
                  <i aria-hidden="true" />
                </div>
                <div className="delay-control-grid">
                  <span><small>MODE</small><strong>STEREO</strong></span>
                  <span><small>TIME</small><strong>1/8</strong></span>
                  <span><small>FEEDBACK</small><strong>20%</strong></span>
                  <span><small>FREQ</small><strong>686Hz</strong></span>
                  <span><small>Q</small><strong>5.5</strong></span>
                  <span className={isLfoHovered ? 'is-envelope-highlighted' : ''}><small>WET</small><strong>{displayedDelayWet}%</strong></span>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`delay-lfo-panel${lfoEnabled ? '' : ' is-off'}`}
            onMouseEnter={() => setIsLfoHovered(true)}
            onMouseLeave={() => setIsLfoHovered(false)}
          >
            <div className="synth-panel-title synth-panel-title-row">
              <span><b>LFO</b><small>调制源</small></span>
              <button type="button" className="synth-filter-toggle" aria-pressed={lfoEnabled} onClick={toggleDelayLfo}>
                <span>{lfoEnabled ? 'ON' : 'OFF'}</span><i />
              </button>
            </div>
            <div
              className={`delay-lfo-curve${lfoEnabled ? '' : ' is-off'}${isPlaying || !lfoEnabled ? ' is-visible' : ''}${isPlaying ? ' is-running' : ''}`}
            >
              <svg viewBox="0 0 720 270" preserveAspectRatio="none" aria-label="LFO 曲线">
                <defs>
                  <linearGradient id="delay-lfo-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#d8ff45" stopOpacity=".24" />
                    <stop offset=".72" stopColor="#d8ff45" stopOpacity=".07" />
                    <stop offset="1" stopColor="#d8ff45" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path className="delay-lfo-area" d="M 14 256 C 175 256 302 238 405 92 L 706 14 L 706 256 Z" />
                <path className="delay-lfo-line" d="M 14 256 C 175 256 302 238 405 92 L 706 14" />
              </svg>
              <i
                className="delay-lfo-scan"
                style={{ left: `calc(${(delayLfoPhase * 100).toFixed(4)}% + ${(14 - delayLfoPhase * 28).toFixed(4)}px)` }}
                aria-hidden="true"
              />
              <i className="delay-lfo-point" style={{ '--point-x': 'clamp(12px, 1.944%, 24px)', '--point-y': '94.815%' }} aria-hidden="true" />
              <i className="delay-lfo-point" style={{ '--point-x': '27.778%', '--point-y': '88.231%' }} aria-hidden="true" />
              <i className="delay-lfo-point" style={{ '--point-x': '56.25%', '--point-y': '34.074%' }} aria-hidden="true" />
              <i className="delay-lfo-point" style={{ '--point-x': '78.194%', '--point-y': '18.91%' }} aria-hidden="true" />
              <i className="delay-lfo-point" style={{ '--point-x': 'calc(100% - clamp(12px, 1.944%, 24px))', '--point-y': '5.185%' }} aria-hidden="true" />
            </div>
            <div className="delay-lfo-params" aria-label="LFO 参数">
              <span><small>MODE</small><strong>FREE</strong></span>
              <span><small>RATE</small><strong>1 BAR</strong></span>
              <span><small>DESTINATION</small><strong>DELAY WET</strong></span>
            </div>
            <div className="delay-note delay-lfo-note">
              <span>PRODUCTION NOTE</span>
              <p aria-label="Production Note 内容待补充">全程打开 Delay FX 会导致句首音色模糊混沌，通过 LFO 控制在接近小节结尾时慢慢提高 Delay Wet，在保持音色清晰的同时让句尾有明显的延时效果</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <SynthDrumSection />

    <footer className="synth-detail-footer"><span>360 SYNTH DESIGN · AUGUST REMAKE</span><a href="#synth-design" onClick={scrollToSynthTop}>BACK TO TOP ↑</a></footer>
  </section>
}

function DrumLayeringMute({ label, muted, onToggle }) {
  return <button
    type="button"
    className={`drum-channel-button drum-mute${muted ? ' is-muted' : ''}`}
    onClick={onToggle}
    aria-pressed={muted}
    aria-label={`${muted ? '取消静音' : '静音'} ${label}`}
  >
    {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
    <span>M</span>
  </button>
}

function Focus2Icon({ size = 24, ...props }) {
  return <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path fill="currentColor" d="M11.5 12a.5.5 0 1 0 1 0a.5.5 0 1 0-1 0" />
      <path d="M5 12a7 7 0 1 0 14 0a7 7 0 1 0-14 0m7-9v2m-9 7h2m7 7v2m7-9h2" />
    </g>
  </svg>
}

function FocusIcon({ size = 24, ...props }) {
  return <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path fill="currentColor" d="M11.5 12a.5.5 0 1 0 1 0a.5.5 0 1 0-1 0" />
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0" />
    </g>
  </svg>
}

function DrumLayeringSolo({ label, soloed, onToggle }) {
  const SoloIcon = soloed ? Focus2Icon : FocusIcon
  return <button
    type="button"
    className={`drum-channel-button drum-solo${soloed ? ' is-soloed' : ''}`}
    onClick={onToggle}
    aria-pressed={soloed}
    aria-label={`${soloed ? '取消独奏' : '独奏'} ${label}`}
  >
    <SoloIcon size={15} aria-hidden="true" />
    <span>S</span>
  </button>
}

function makeDrumWaveformPath(buffer, sampleCount = 320, duration = buffer.duration, offset = 0) {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index))
  const frameOffset = Math.max(0, Math.min(buffer.length, Math.round(offset * buffer.sampleRate)))
  const frameLength = Math.max(0, Math.min(buffer.length - frameOffset, Math.round(duration * buffer.sampleRate)))
  const samples = Array.from({ length: sampleCount }, (_, index) => {
    const start = frameOffset + Math.floor(index / sampleCount * frameLength)
    const end = Math.max(start + 1, frameOffset + Math.floor((index + 1) / sampleCount * frameLength))
    const stride = Math.max(1, Math.floor((end - start) / 48))
    let peak = 0
    for (let frame = start; frame < end; frame += stride) {
      for (const channel of channels) peak = Math.max(peak, Math.abs(channel[frame] || 0))
    }
    return peak
  })
  const maximum = Math.max(...samples, .001)
  const amplitudes = samples.map(sample => Math.max(1.2, Math.pow(sample / maximum, .72) * 43))
  const top = amplitudes.map((amplitude, index) => `${index ? 'L' : 'M'}${index} ${50 - amplitude}`).join(' ')
  const bottom = amplitudes.map((_, index) => `L${sampleCount - index - 1} ${50 + amplitudes[sampleCount - index - 1]}`).join(' ')
  return `${top} ${bottom} Z`
}

function DrumWaveformClip({ color, waveformPath, span = 1, start, startBeat, durationBeats, timelineBars = DRUM_LAYERING_BARS, subdued = false, compact = false }) {
  const placement = startBeat === undefined
    ? { gridColumn: `${start ? `${start} / ` : ''}span ${span}` }
    : {
        position: 'absolute',
        top: compact ? 0 : 7,
        bottom: compact ? 0 : 7,
        height: 'auto',
        left: `${startBeat / (timelineBars * DRUM_LAYERING_BEATS) * 100}%`,
        width: `${durationBeats / (timelineBars * DRUM_LAYERING_BEATS) * 100}%`,
      }
  return <span className={`drum-waveform-clip${subdued ? ' is-subdued' : ''}${compact ? ' is-compact' : ''}`} style={{ '--clip-color': color, ...placement }}>
    <svg viewBox="0 0 319 100" preserveAspectRatio="none" aria-hidden="true">
      <line className="drum-waveform-zero" x1="0" y1="50" x2="319" y2="50" />
      {waveformPath && <path className="drum-waveform-shape" d={waveformPath} />}
    </svg>
  </span>
}

function DrumTrackClips({ track, color, waveformPath, subdued = false, compact = false }) {
  if (track.segments?.length) {
    return track.segments.map(segment => {
      const startBar = Math.max(1, Math.min(DRUM_LAYERING_BARS, segment.startBar || 1))
      const span = Math.max(1, Math.min(segment.bars || 1, DRUM_LAYERING_BARS - startBar + 1))
      const segmentWaveformPath = waveformPath instanceof Map ? waveformPath.get(segment.id) : waveformPath
      return <DrumWaveformClip key={segment.id} color={color} waveformPath={segmentWaveformPath} span={span} start={startBar} subdued={subdued} compact={compact} />
    })
  }

  const loopBars = Math.max(1, Math.min(DRUM_LAYERING_BARS, track.loopBars || 1))
  const repeatEveryBars = Math.max(1, Math.min(DRUM_LAYERING_BARS, track.repeatEveryBars || loopBars))
  const startBar = Math.max(1, Math.min(DRUM_LAYERING_BARS, track.startBar || 1))
  const availableBars = DRUM_LAYERING_BARS - startBar + 1
  const repetitions = Math.min(track.repeatCount || Infinity, Math.ceil(availableBars / repeatEveryBars))
  if (track.hitBeats?.length) {
    const patternBeats = repeatEveryBars * DRUM_LAYERING_BEATS
    const firstBeat = (startBar - 1) * DRUM_LAYERING_BEATS
    return Array.from({ length: repetitions }, (_, repetition) => (
      track.hitBeats.map((hitBeat, hitIndex) => {
        const startBeat = firstBeat + repetition * patternBeats + hitBeat
        const durationBeats = Math.min(track.hitDurationBeats || 1, DRUM_LAYERING_BARS * DRUM_LAYERING_BEATS - startBeat)
        return <DrumWaveformClip
          key={`${repetition}-${hitIndex}`}
          color={color}
          waveformPath={waveformPath}
          startBeat={startBeat}
          durationBeats={durationBeats}
          subdued={subdued}
          compact={compact}
        />
      })
    ))
  }
  return Array.from({ length: repetitions }, (_, repetition) => {
    const clipStart = startBar + repetition * repeatEveryBars
    const span = Math.min(loopBars, DRUM_LAYERING_BARS - clipStart + 1)
    const usesFractionalBars = !Number.isInteger(clipStart) || !Number.isInteger(span)
    return <DrumWaveformClip
      key={repetition}
      color={color}
      waveformPath={waveformPath}
      span={span}
      start={clipStart}
      startBeat={usesFractionalBars ? (clipStart - 1) * DRUM_LAYERING_BEATS : undefined}
      durationBeats={usesFractionalBars ? span * DRUM_LAYERING_BEATS : undefined}
      subdued={subdued}
      compact={compact}
    />
  })
}

function makeDrumClipBuffer(context, sourceBuffer, track) {
  const loopBars = Math.max(1, Math.min(DRUM_LAYERING_BARS, track.loopBars || 1))
  const sourceBars = Math.max(1, Math.min(loopBars, track.sourceBars || loopBars))
  const clipLength = Math.round(loopBars * DRUM_LAYERING_BAR_DURATION * sourceBuffer.sampleRate)
  const hitLength = Math.round((track.hitDurationBeats || 0) * 60 / DRUM_LAYERING_BPM * sourceBuffer.sampleRate)
  const sourceStart = Math.min(
    sourceBuffer.length,
    Math.round((track.sourceOffsetBars || 0) * DRUM_LAYERING_BAR_DURATION * sourceBuffer.sampleRate),
  )
  const sourceLength = Math.min(
    sourceBuffer.length - sourceStart,
    hitLength || Math.round(sourceBars * DRUM_LAYERING_BAR_DURATION * sourceBuffer.sampleRate),
  )
  const clipBuffer = context.createBuffer(sourceBuffer.numberOfChannels, clipLength, sourceBuffer.sampleRate)

  for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel += 1) {
    const source = sourceBuffer.getChannelData(channel).subarray(sourceStart, sourceStart + sourceLength)
    if (track.hitBeats?.length) {
      track.hitBeats.forEach(hitBeat => {
        const offset = Math.round(hitBeat * 60 / DRUM_LAYERING_BPM * sourceBuffer.sampleRate)
        clipBuffer.copyToChannel(source.subarray(0, clipLength - offset), channel, offset)
      })
    } else if (track.repeatSource !== false) {
      for (let offset = 0; offset < clipLength; offset += sourceLength) {
        clipBuffer.copyToChannel(source.subarray(0, clipLength - offset), channel, offset)
      }
    } else {
      clipBuffer.copyToChannel(source.subarray(0, clipLength), channel)
    }
  }

  return clipBuffer
}

function makeDrumSessionBuffer(context, clipBuffer, track) {
  const loopBars = Math.max(1, Math.min(DRUM_LAYERING_BARS, track.loopBars || 1))
  const repeatEveryBars = Math.max(1, Math.min(DRUM_LAYERING_BARS, track.repeatEveryBars || loopBars))
  const startBar = Math.max(1, Math.min(DRUM_LAYERING_BARS, track.startBar || 1))
  const availableBars = DRUM_LAYERING_BARS - startBar + 1
  const repetitions = Math.min(track.repeatCount || Infinity, Math.ceil(availableBars / repeatEveryBars))
  const sessionLength = Math.ceil(DRUM_LAYERING_DURATION * clipBuffer.sampleRate)
  const sessionBuffer = context.createBuffer(clipBuffer.numberOfChannels, sessionLength, clipBuffer.sampleRate)

  for (let channel = 0; channel < clipBuffer.numberOfChannels; channel += 1) {
    const clip = clipBuffer.getChannelData(channel)
    for (let repetition = 0; repetition < repetitions; repetition += 1) {
      const bar = startBar - 1 + repetition * repeatEveryBars
      const offset = Math.round(bar * DRUM_LAYERING_BAR_DURATION * clipBuffer.sampleRate)
      const availableFrames = Math.max(0, sessionLength - offset)
      sessionBuffer.copyToChannel(clip.subarray(0, availableFrames), channel, offset)
    }
  }

  return sessionBuffer
}

function makeDrumSegmentedSessionBuffer(context, buffers, track) {
  const sourceBuffers = track.segments.map(segment => buffers.get(segment.src))
  const sampleRate = sourceBuffers[0].sampleRate
  const channelCount = Math.max(...sourceBuffers.map(buffer => buffer.numberOfChannels))
  const sessionLength = Math.ceil(DRUM_LAYERING_DURATION * sampleRate)
  const sessionBuffer = context.createBuffer(channelCount, sessionLength, sampleRate)

  track.segments.forEach((segment, segmentIndex) => {
    const sourceBuffer = sourceBuffers[segmentIndex]
    const startBar = Math.max(1, Math.min(DRUM_LAYERING_BARS, segment.startBar || 1))
    const offset = Math.round((startBar - 1) * DRUM_LAYERING_BAR_DURATION * sampleRate)
    const segmentLength = Math.min(
      sourceBuffer.length,
      Math.round((segment.bars || 1) * DRUM_LAYERING_BAR_DURATION * sampleRate),
      sessionLength - offset,
    )

    for (let channel = 0; channel < channelCount; channel += 1) {
      const sourceChannel = sourceBuffer.getChannelData(Math.min(channel, sourceBuffer.numberOfChannels - 1))
      sessionBuffer.copyToChannel(sourceChannel.subarray(0, segmentLength), channel, offset)
    }
  })

  return sessionBuffer
}

function makeSnareCaseBuffers(context, sourceBuffer, offset = 0) {
  const sampleRate = sourceBuffer.sampleRate
  const length = Math.ceil(SNARE_CASE_DURATION * sampleRate)
  const channelCount = Math.max(2, sourceBuffer.numberOfChannels)
  const buffers = {
    odd: context.createBuffer(channelCount, length, sampleRate),
    even: context.createBuffer(channelCount, length, sampleRate),
  }
  const sourceLength = Math.min(sourceBuffer.length, Math.round(DRUM_LAYERING_BAR_DURATION * sampleRate))
  const beatLength = Math.round(SNARE_CASE_BEAT_DURATION * sampleRate)
  const offsetFrames = Math.round(offset * sampleRate)

  for (let bar = 0; bar < SNARE_CASE_BARS; bar += 1) {
    const targetStart = Math.round(bar * DRUM_LAYERING_BAR_DURATION * sampleRate) + offsetFrames
    for (let channel = 0; channel < channelCount; channel += 1) {
      const source = sourceBuffer.getChannelData(Math.min(channel, sourceBuffer.numberOfChannels - 1))
      for (let frame = 0; frame < sourceLength && targetStart + frame < length; frame += 1) {
        const beatIndex = Math.min(DRUM_LAYERING_BEATS - 1, Math.floor(frame / beatLength))
        const group = beatIndex % 2 === 0 ? 'odd' : 'even'
        buffers[group].getChannelData(channel)[targetStart + frame] = source[frame]
      }
    }
  }
  return buffers
}

function makeSnareCaseEffectsBuffer(context, sourceBuffer) {
  const sampleRate = sourceBuffer.sampleRate
  const length = Math.ceil(SNARE_CASE_DURATION * sampleRate)
  const channelCount = Math.max(2, sourceBuffer.numberOfChannels)
  const buffer = context.createBuffer(channelCount, length, sampleRate)
  const repeatLength = Math.round(DRUM_LAYERING_BAR_DURATION * sampleRate)

  for (let channel = 0; channel < channelCount; channel += 1) {
    const source = sourceBuffer.getChannelData(Math.min(channel, sourceBuffer.numberOfChannels - 1))
    const target = buffer.getChannelData(channel)
    for (let repeatStart = 0; repeatStart < length; repeatStart += repeatLength) {
      const copyLength = Math.min(source.length, length - repeatStart)
      for (let frame = 0; frame < copyLength; frame += 1) {
        target[repeatStart + frame] += source[frame]
      }
    }
  }

  return buffer
}

function SnareEqCurve({ layerId }) {
  const curves = {
    'phonk-snare': {
      points: [
        [8, 82], [24, 73], [39, 67], [53, 62], [78, 58], [90, 55],
        [100, 52], [111, 50], [122, 51], [134, 54], [150, 58], [169, 59], [191, 59], [211, 60],
        [228, 65], [242, 70], [252, 72], [264, 69], [282, 63], [300, 59], [312, 58],
      ],
    },
    'small-wonder': {
      points: [
        [8, 122], [24, 94], [39, 75], [53, 66], [78, 64], [95, 67],
        [111, 70], [128, 66], [150, 61], [180, 57], [211, 49], [235, 40],
        [252, 36], [264, 38], [282, 45], [299, 53], [312, 57],
      ],
    },
    seismic: {
      points: [
        [8, 124], [24, 95], [39, 72], [53, 64], [78, 63], [95, 66],
        [111, 70], [128, 66], [150, 60], [180, 55], [211, 45], [228, 36],
        [238, 39], [251, 46], [264, 52], [281, 55], [293, 54], [304, 51], [312, 50],
      ],
    },
  }
  const curve = curves[layerId]
  const path = makeSmoothChartPath(curve.points.map(([x, y]) => ({ x, y })))

  return <svg className="snare-eq-graph" viewBox="0 0 320 116" preserveAspectRatio="none" aria-hidden="true">
    <path className="snare-eq-zero" d="M 8 58 L 312 58" />
    <path className="snare-eq-area" d={`${path} L 312 108 L 8 108 Z`} />
    <path className="snare-eq-line" d={path} />
  </svg>
}

function SnareBusEqCurve({ variant, hitNumber }) {
  const prefersReducedMotion = useReducedMotion()
  const curves = {
    odd: [
      [8, 142], [22, 140], [38, 132], [56, 112], [74, 91], [96, 82],
      [118, 78], [139, 69], [156, 58], [171, 74], [191, 132], [210, 103],
      [230, 85], [252, 82], [272, 83], [290, 85], [307, 89], [320, 94],
      [328, 143], [340, 132], [352, 124],
    ],
    even: [
      [8, 142], [22, 140], [38, 132], [56, 112], [74, 91], [96, 82],
      [118, 78], [139, 69], [156, 58], [171, 74], [191, 132], [210, 103],
      [230, 84], [252, 68], [272, 51], [290, 42], [307, 51], [320, 60],
      [328, 137], [340, 126], [352, 116],
    ],
  }
  const [displayPoints, setDisplayPoints] = useState(() => curves[variant])
  const displayPointsRef = useRef(curves[variant])
  const morphFrameRef = useRef(0)

  useEffect(() => {
    cancelAnimationFrame(morphFrameRef.current)
    const from = displayPointsRef.current
    const to = curves[variant]
    if (prefersReducedMotion) {
      displayPointsRef.current = to
      setDisplayPoints(to)
      return undefined
    }

    const startedAt = performance.now()
    const duration = 180
    const update = now => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = to.map(([x, targetY], index) => [
        x,
        from[index][1] + (targetY - from[index][1]) * eased,
      ])
      displayPointsRef.current = next
      setDisplayPoints(next)
      if (progress < 1) morphFrameRef.current = requestAnimationFrame(update)
    }
    morphFrameRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(morphFrameRef.current)
  }, [variant, prefersReducedMotion])

  const path = makeSmoothChartPath(displayPoints.map(([x, y]) => ({ x, y })))

  return <div className={`snare-bus-eq-canvas is-${variant}`} role="img" aria-label={`BUS EQ：第 ${hitNumber} 次 Snare 击打，使用${variant === 'odd' ? '奇数' : '偶数'}次曲线`}>
    <svg viewBox="0 0 360 164" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="snare-bus-eq-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ac8aba" stopOpacity=".24" />
          <stop offset="1" stopColor="#ac8aba" stopOpacity=".015" />
        </linearGradient>
      </defs>
      <path className="snare-bus-eq-zero" d="M 8 82 L 352 82" />
      <path className="snare-bus-eq-area" d={`${path} L 352 156 L 8 156 Z`} />
      <path className="snare-bus-eq-line" d={path} />
    </svg>
    <span className="snare-bus-eq-state">HIT {String(hitNumber).padStart(2, '0')} · {variant.toUpperCase()}</span>
    <div className="snare-eq-frequency-axis snare-bus-eq-frequency-axis" aria-hidden="true">
      {['20', '50', '100', '200', '500', '1k', '2k', '5k', '10k', '20k'].map(label => <span key={label}>{label}</span>)}
    </div>
  </div>
}

function ShutDownLineIcon({ size = 24, ...props }) {
  return <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="m6.265 3.807l1.147 1.639a8 8 0 1 0 9.176 0l1.147-1.639A9.99 9.99 0 0 1 22 12c0 5.523-4.477 10-10 10S2 17.523 2 12a9.99 9.99 0 0 1 4.265-8.193M11 12V2h2v10z" />
  </svg>
}

function SnareLayeringCaseStudy({ timelinePlaying, onPlaybackStart }) {
  const [mutedLayers, setMutedLayers] = useState(() => new Set())
  const [soloedLayers, setSoloedLayers] = useState(() => new Set())
  const [alignmentMode, setAlignmentMode] = useState('aligned')
  const [enabledEqLayers, setEnabledEqLayers] = useState(() => new Set())
  const [compressorEnabled, setCompressorEnabled] = useState(false)
  const [busEqEnabled, setBusEqEnabled] = useState(false)
  const [enabledEffects, setEnabledEffects] = useState(() => new Set())
  const [othersEnabled, setOthersEnabled] = useState(false)
  const [audioLoadState, setAudioLoadState] = useState('loading')
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [waveformPaths, setWaveformPaths] = useState(() => new Map())
  const audioContextRef = useRef(null)
  const caseBuffersRef = useRef(new Map())
  const stepThreeBuffersRef = useRef({ compressor: null, eq: null, combined: null })
  const stepFourBuffersRef = useRef(new Map())
  const stepFiveBufferRef = useRef(null)
  const activeSourcesRef = useRef([])
  const activeNodesRef = useRef([])
  const positionRef = useRef(0)
  const animationFrameRef = useRef(0)
  const playbackStartedAtRef = useRef(0)
  const playbackOffsetRef = useRef(0)
  const othersBarClockRef = useRef(0)
  const othersPlaybackOffsetRef = useRef(0)

  const stopPlaybackGraph = () => {
    activeSourcesRef.current.forEach(source => {
      try { source.stop() } catch { /* Source may already be stopped. */ }
    })
    activeNodesRef.current.forEach(node => {
      try { node.disconnect() } catch { /* Node may already be disconnected. */ }
    })
    activeSourcesRef.current = []
    activeNodesRef.current = []
  }

  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) {
      setAudioLoadState('error')
      return undefined
    }
    const context = new AudioContextClass({ latencyHint: 'interactive' })
    audioContextRef.current = context
    let cancelled = false

    const layerBufferRequest = Promise.all(snareCaseLayers.map(async layer => {
      const [dryResponse, eqResponse] = await Promise.all([fetch(layer.src), fetch(layer.eqSrc)])
      if (!dryResponse.ok || !eqResponse.ok) throw new Error(`Unable to load ${layer.label}`)
      const [drySourceBuffer, eqSourceBuffer] = await Promise.all([
        context.decodeAudioData(await dryResponse.arrayBuffer()),
        context.decodeAudioData(await eqResponse.arrayBuffer()),
      ])
      return {
        id: layer.id,
        dry: {
          aligned: makeSnareCaseBuffers(context, drySourceBuffer, layer.alignment.aligned.seconds),
          loose: makeSnareCaseBuffers(context, drySourceBuffer, layer.alignment.loose.seconds),
        },
        eq: {
          aligned: makeSnareCaseBuffers(context, eqSourceBuffer, layer.alignment.aligned.seconds),
          loose: makeSnareCaseBuffers(context, eqSourceBuffer, layer.alignment.loose.seconds),
        },
        waveform: makeDrumWaveformPath(drySourceBuffer, 320, SNARE_CASE_WAVEFORM_WINDOW, SNARE_CASE_WAVEFORM_OFFSET),
      }
    }))
    const stepThreeBufferRequest = Promise.all(Object.entries({
      compressor: snareCaseCompressorAudio,
      eq: snareCaseBusEqAudio,
      combined: snareCaseCompressorEqAudio,
    }).map(async ([key, src]) => {
      const response = await fetch(src)
      if (!response.ok) throw new Error(`Unable to load Step 3 ${key}`)
      const sourceBuffer = await context.decodeAudioData(await response.arrayBuffer())
      return [key, makeSnareCaseBuffers(context, sourceBuffer)]
    }))
    const stepFourBufferRequest = Promise.all(Object.entries({
      '000': snareCaseFxEmptyAudio,
      '001': snareCaseFxRoomAudio,
      '100': snareCaseFxChamberAudio,
      '101': snareCaseFxChamberRoomAudio,
      '010': snareCaseFxDelayAudio,
      '011': snareCaseFxDelayRoomAudio,
      '110': snareCaseFxChamberDelayAudio,
      '111': snareCaseFxChamberDelayRoomAudio,
    }).map(async ([key, src]) => {
      const response = await fetch(src)
      if (!response.ok) throw new Error(`Unable to load Step 4 ${key}`)
      const sourceBuffer = await context.decodeAudioData(await response.arrayBuffer())
      return [key, makeSnareCaseEffectsBuffer(context, sourceBuffer)]
    }))
    const stepFiveBufferRequest = fetch(snareCaseOthersAudio).then(async response => {
      if (!response.ok) throw new Error('Unable to load Step 5 Others')
      return context.decodeAudioData(await response.arrayBuffer())
    })

    Promise.all([layerBufferRequest, stepThreeBufferRequest, stepFourBufferRequest, stepFiveBufferRequest]).then(([results, stepThreeEntries, stepFourEntries, stepFiveBuffer]) => {
      if (cancelled) return
      results.forEach(result => caseBuffersRef.current.set(result.id, result))
      stepThreeBuffersRef.current = Object.fromEntries(stepThreeEntries)
      stepFourBuffersRef.current = new Map(stepFourEntries)
      stepFiveBufferRef.current = stepFiveBuffer
      setWaveformPaths(new Map(results.map(result => [result.id, result.waveform])))
      setAudioLoadState('ready')
    }).catch(error => {
      if (cancelled) return
      console.warn('[snare-case-study] 音频预加载失败：', error)
      setAudioLoadState('error')
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(animationFrameRef.current)
      stopPlaybackGraph()
      context.close().catch(() => {})
      audioContextRef.current = null
    }
  }, [])

  useEffect(() => {
    if (timelinePlaying) setIsPlaying(false)
  }, [timelinePlaying])

  const snareConfiguration = {
    mutedLayers,
    soloedLayers,
    alignmentMode,
    enabledEqLayers,
    compressorEnabled,
    busEqEnabled,
    enabledEffects,
  }
  const audibleLayerIdsFor = configuration => new Set(snareCaseLayers
    .filter(layer => (
      !configuration.mutedLayers.has(layer.id)
      && (configuration.soloedLayers.size === 0 || configuration.soloedLayers.has(layer.id))
    ))
    .map(layer => layer.id))
  const audibleLayerIds = audibleLayerIdsFor(snareConfiguration)

  const startPlaybackGraph = (
    offset = positionRef.current % SNARE_CASE_DURATION,
    preserveVisualClock = false,
    configuration = snareConfiguration,
    playOthers = othersEnabled,
  ) => {
    const context = audioContextRef.current
    const nextAudibleLayerIds = audibleLayerIdsFor(configuration)
    if (!context || audioLoadState !== 'ready' || (nextAudibleLayerIds.size === 0 && !playOthers)) return false

    if (!preserveVisualClock) cancelAnimationFrame(animationFrameRef.current)
    const previousSources = preserveVisualClock ? activeSourcesRef.current : []
    const previousNodes = preserveVisualClock ? activeNodesRef.current : []
    const previousMaster = preserveVisualClock ? previousNodes[0] : null
    if (preserveVisualClock) {
      activeSourcesRef.current = []
      activeNodesRef.current = []
    } else {
      stopPlaybackGraph()
    }
    const resumePromise = context.resume()
    const graphNodes = []
    const master = context.createGain()
    const dryBus = context.createGain()
    const startsAt = context.currentTime
    master.gain.setValueAtTime(preserveVisualClock ? 0 : SNARE_CASE_MASTER_GAIN, startsAt)
    if (preserveVisualClock) master.gain.linearRampToValueAtTime(SNARE_CASE_MASTER_GAIN, startsAt + LIVE_AUDIO_SWITCH_FADE)
    if (previousMaster?.gain) {
      previousMaster.gain.cancelScheduledValues(startsAt)
      previousMaster.gain.setValueAtTime(previousMaster.gain.value, startsAt)
      previousMaster.gain.linearRampToValueAtTime(0, startsAt + LIVE_AUDIO_SWITCH_FADE)
    }
    dryBus.connect(master)
    master.connect(context.destination)
    graphNodes.push(master, dryBus)

    const selectedBuffers = configuration.alignmentMode === 'aligned' ? 'aligned' : 'loose'
    const safeOffset = offset % SNARE_CASE_DURATION
    const safeOthersOffset = preserveVisualClock
      ? renderedPlaybackPosition(
          context,
          playbackStartedAtRef.current,
          othersPlaybackOffsetRef.current,
          SNARE_CASE_OTHERS_DURATION,
        )
      : othersBarClockRef.current % SNARE_CASE_OTHERS_DURATION
    const effectsEnabled = configuration.enabledEffects.size > 0
    const stepFourVersion = [
      configuration.enabledEffects.has('chamber') ? '1' : '0',
      configuration.enabledEffects.has('delay') ? '1' : '0',
      configuration.enabledEffects.has('room') ? '1' : '0',
    ].join('')
    const usesStepFourAudio = effectsEnabled || (
      configuration.mutedLayers.size === 0
      && configuration.soloedLayers.size === 0
      && configuration.alignmentMode === 'aligned'
      && snareCaseLayers.every(layer => configuration.enabledEqLayers.has(layer.id))
      && configuration.compressorEnabled
      && configuration.busEqEnabled
    )
    const stepThreeVersion = configuration.compressorEnabled && configuration.busEqEnabled
      ? 'combined'
      : configuration.compressorEnabled ? 'compressor' : configuration.busEqEnabled ? 'eq' : null
    const connectRenderedSource = sourceNode => sourceNode.connect(dryBus)

    if (usesStepFourAudio) {
      const source = context.createBufferSource()
      source.buffer = stepFourBuffersRef.current.get(stepFourVersion)
      source.loop = true
      source.loopEnd = SNARE_CASE_DURATION
      connectRenderedSource(source)
      source.start(startsAt, safeOffset)
      activeSourcesRef.current.push(source)
      graphNodes.push(source)
    } else if (stepThreeVersion) {
      const rendered = stepThreeBuffersRef.current[stepThreeVersion]
      ;['odd', 'even'].forEach(group => {
        const source = context.createBufferSource()
        source.buffer = rendered[group]
        source.loop = true
        source.loopEnd = SNARE_CASE_DURATION
        connectRenderedSource(source)
        source.start(startsAt, safeOffset)
        activeSourcesRef.current.push(source)
        graphNodes.push(source)
      })
    } else {
      snareCaseLayers.forEach(layer => {
        if (!nextAudibleLayerIds.has(layer.id)) return
        const audioVersion = configuration.enabledEqLayers.has(layer.id) ? 'eq' : 'dry'
        const rendered = caseBuffersRef.current.get(layer.id)?.[audioVersion]?.[selectedBuffers]
        if (!rendered) return
        ;['odd', 'even'].forEach(group => {
          const source = context.createBufferSource()
          const layerGain = context.createGain()
          source.buffer = rendered[group]
          source.loop = true
          source.loopEnd = SNARE_CASE_DURATION
          layerGain.gain.value = layer.gain
          source.connect(layerGain)
          connectRenderedSource(layerGain)
          source.start(startsAt, safeOffset)
          activeSourcesRef.current.push(source)
          graphNodes.push(source, layerGain)
        })
      })
    }
    if (playOthers && stepFiveBufferRef.current) {
      const othersSource = context.createBufferSource()
      othersSource.buffer = stepFiveBufferRef.current
      othersSource.loop = true
      othersSource.loopEnd = SNARE_CASE_OTHERS_DURATION
      connectRenderedSource(othersSource)
      othersSource.start(startsAt, safeOthersOffset)
      activeSourcesRef.current.push(othersSource)
      graphNodes.push(othersSource)
    }
    activeNodesRef.current = graphNodes
    if (preserveVisualClock && previousSources.length) {
      window.setTimeout(() => {
        previousSources.forEach(source => {
          try { source.stop() } catch {}
        })
        previousNodes.forEach(node => {
          try { node.disconnect() } catch {}
        })
      }, (LIVE_AUDIO_SWITCH_FADE * 1000) + 12)
    }
    if (!preserveVisualClock) {
      playbackStartedAtRef.current = startsAt
      playbackOffsetRef.current = safeOffset
      othersPlaybackOffsetRef.current = safeOthersOffset
    }
    resumePromise.catch(error => {
      console.warn('[snare-case-study] 无法开始播放：', error)
      setIsPlaying(false)
    })

    if (!preserveVisualClock) {
      const update = () => {
        const nextPosition = audiblePlaybackPosition(
          context,
          playbackStartedAtRef.current,
          playbackOffsetRef.current,
          SNARE_CASE_DURATION,
        )
        positionRef.current = nextPosition
        othersBarClockRef.current = audiblePlaybackPosition(
          context,
          playbackStartedAtRef.current,
          othersPlaybackOffsetRef.current,
          SNARE_CASE_OTHERS_DURATION,
        )
        setPosition(nextPosition)
        animationFrameRef.current = requestAnimationFrame(update)
      }
      animationFrameRef.current = requestAnimationFrame(update)
    }
    return true
  }

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animationFrameRef.current)
      stopPlaybackGraph()
    }
  }, [isPlaying])

  const applySnareConfiguration = configuration => {
    if (isPlaying) {
      if (audibleLayerIdsFor(configuration).size === 0 && !othersEnabled) {
        cancelAnimationFrame(animationFrameRef.current)
        stopPlaybackGraph()
        setIsPlaying(false)
      } else {
        const context = audioContextRef.current
        const renderPosition = renderedPlaybackPosition(
          context,
          playbackStartedAtRef.current,
          playbackOffsetRef.current,
          SNARE_CASE_DURATION,
        )
        startPlaybackGraph(renderPosition, true, configuration)
      }
    }
    setMutedLayers(configuration.mutedLayers)
    setSoloedLayers(configuration.soloedLayers)
    setAlignmentMode(configuration.alignmentMode)
    setEnabledEqLayers(configuration.enabledEqLayers)
    setCompressorEnabled(configuration.compressorEnabled)
    setBusEqEnabled(configuration.busEqEnabled)
    setEnabledEffects(configuration.enabledEffects)
  }

  const resetDownstreamProcessing = configuration => ({
    ...configuration,
    compressorEnabled: false,
    busEqEnabled: false,
    enabledEffects: new Set(),
  })

  const enableRenderedProcessingPrerequisites = configuration => ({
    ...configuration,
    mutedLayers: new Set(),
    soloedLayers: new Set(),
    alignmentMode: 'aligned',
    enabledEqLayers: new Set(snareCaseLayers.map(layer => layer.id)),
  })

  const toggleLayerMute = id => {
    const nextMutedLayers = new Set(mutedLayers)
    if (nextMutedLayers.has(id)) nextMutedLayers.delete(id)
    else nextMutedLayers.add(id)
    applySnareConfiguration(resetDownstreamProcessing({ ...snareConfiguration, mutedLayers: nextMutedLayers }))
  }
  const toggleLayerSolo = id => {
    const nextSoloedLayers = new Set(soloedLayers)
    if (nextSoloedLayers.has(id)) nextSoloedLayers.delete(id)
    else nextSoloedLayers.add(id)
    applySnareConfiguration(resetDownstreamProcessing({ ...snareConfiguration, soloedLayers: nextSoloedLayers }))
  }
  const enableAllLayers = () => {
    applySnareConfiguration(resetDownstreamProcessing({
      ...snareConfiguration,
      mutedLayers: new Set(),
      soloedLayers: new Set(),
    }))
  }
  const setSnareAlignmentMode = mode => {
    if (mode === alignmentMode) return
    applySnareConfiguration(resetDownstreamProcessing({ ...snareConfiguration, alignmentMode: mode }))
  }
  const allEqEnabled = snareCaseLayers.every(layer => enabledEqLayers.has(layer.id))
  const anyEqEnabled = enabledEqLayers.size > 0
  const toggleAllEq = () => {
    const nextEnabledEqLayers = allEqEnabled ? new Set() : new Set(snareCaseLayers.map(layer => layer.id))
    applySnareConfiguration(resetDownstreamProcessing({
      ...snareConfiguration,
      enabledEqLayers: nextEnabledEqLayers,
    }))
  }
  const toggleLayerEq = id => {
    const nextEnabledEqLayers = new Set(enabledEqLayers)
    if (nextEnabledEqLayers.has(id)) nextEnabledEqLayers.delete(id)
    else nextEnabledEqLayers.add(id)
    applySnareConfiguration(resetDownstreamProcessing({
      ...snareConfiguration,
      enabledEqLayers: nextEnabledEqLayers,
    }))
  }
  const toggleCompressor = () => {
    if (compressorEnabled) {
      applySnareConfiguration({
        ...snareConfiguration,
        compressorEnabled: false,
        enabledEffects: new Set(),
      })
      return
    }
    applySnareConfiguration(enableRenderedProcessingPrerequisites({
      ...snareConfiguration,
      compressorEnabled: true,
      enabledEffects: new Set(),
    }))
  }
  const toggleBusEq = () => {
    if (busEqEnabled) {
      applySnareConfiguration({
        ...snareConfiguration,
        busEqEnabled: false,
        enabledEffects: new Set(),
      })
      return
    }
    applySnareConfiguration(enableRenderedProcessingPrerequisites({
      ...snareConfiguration,
      busEqEnabled: true,
      enabledEffects: new Set(),
    }))
  }
  const allStepThreeEnabled = compressorEnabled && busEqEnabled
  const anyStepThreeEnabled = compressorEnabled || busEqEnabled
  const toggleAllStepThree = () => {
    if (allStepThreeEnabled) {
      applySnareConfiguration({
        ...snareConfiguration,
        compressorEnabled: false,
        busEqEnabled: false,
        enabledEffects: new Set(),
      })
      return
    }
    applySnareConfiguration(enableRenderedProcessingPrerequisites({
      ...snareConfiguration,
      compressorEnabled: true,
      busEqEnabled: true,
      enabledEffects: new Set(),
    }))
  }
  const allEffectsEnabled = enabledEffects.size === 3
  const anyEffectsEnabled = enabledEffects.size > 0
  const toggleAllEffects = () => {
    if (allEffectsEnabled) {
      applySnareConfiguration({ ...snareConfiguration, enabledEffects: new Set() })
      return
    }
    applySnareConfiguration(enableRenderedProcessingPrerequisites({
      ...snareConfiguration,
      compressorEnabled: true,
      busEqEnabled: true,
      enabledEffects: new Set(['chamber', 'delay', 'room']),
    }))
  }
  const toggleEffect = id => {
    const nextEnabledEffects = new Set(enabledEffects)
    if (nextEnabledEffects.has(id)) nextEnabledEffects.delete(id)
    else nextEnabledEffects.add(id)
    const nextConfiguration = { ...snareConfiguration, enabledEffects: nextEnabledEffects }
    applySnareConfiguration(nextEnabledEffects.size
      ? enableRenderedProcessingPrerequisites({
          ...nextConfiguration,
          compressorEnabled: true,
          busEqEnabled: true,
        })
      : nextConfiguration)
  }
  const toggleOthers = () => {
    const nextOthersEnabled = !othersEnabled
    if (isPlaying) {
      if (!nextOthersEnabled && audibleLayerIds.size === 0) {
        cancelAnimationFrame(animationFrameRef.current)
        stopPlaybackGraph()
        setIsPlaying(false)
      } else {
        const context = audioContextRef.current
        const renderPosition = renderedPlaybackPosition(
          context,
          playbackStartedAtRef.current,
          playbackOffsetRef.current,
          SNARE_CASE_DURATION,
        )
        startPlaybackGraph(renderPosition, true, snareConfiguration, nextOthersEnabled)
      }
    }
    setOthersEnabled(nextOthersEnabled)
  }
  const togglePlayback = () => {
    if (audioLoadState !== 'ready') return
    if (isPlaying) {
      cancelAnimationFrame(animationFrameRef.current)
      stopPlaybackGraph()
      setIsPlaying(false)
      return
    }
    onPlaybackStart?.()
    if (startPlaybackGraph()) setIsPlaying(true)
  }

  const displayPosition = Math.min(position, SNARE_CASE_DURATION - .001)
  const currentBar = Math.floor(displayPosition / DRUM_LAYERING_BAR_DURATION) + 1
  const currentBeat = Math.floor((displayPosition % DRUM_LAYERING_BAR_DURATION) / SNARE_CASE_BEAT_DURATION) + 1
  const snareHitInterval = SNARE_CASE_BEAT_DURATION * 2
  const compressorHitPhase = (
    displayPosition - SNARE_CASE_HIT_TIMES[0] + SNARE_CASE_DURATION
  ) % snareHitInterval
  const gainReductionDb = !isPlaying || !compressorEnabled
    ? 0
    : compressorHitPhase < SNARE_CASE_COMPRESSOR_VISUAL_ATTACK
      ? SNARE_CASE_MAX_GAIN_REDUCTION * compressorHitPhase / SNARE_CASE_COMPRESSOR_VISUAL_ATTACK
      : compressorHitPhase < SNARE_CASE_COMPRESSOR_VISUAL_ATTACK + SNARE_CASE_COMPRESSOR_VISUAL_RELEASE
        ? SNARE_CASE_MAX_GAIN_REDUCTION * Math.pow(
            1 - (compressorHitPhase - SNARE_CASE_COMPRESSOR_VISUAL_ATTACK) / SNARE_CASE_COMPRESSOR_VISUAL_RELEASE,
            2,
          )
        : 0
  const gainReductionProgress = gainReductionDb / SNARE_CASE_MAX_GAIN_REDUCTION
  const gainReductionLabel = gainReductionDb >= .05 ? `−${gainReductionDb.toFixed(1)}` : '0.0'
  const busEqDisplayPosition = (displayPosition + SNARE_CASE_BUS_EQ_LOOKAHEAD) % SNARE_CASE_DURATION
  const snareHitPhase = (
    busEqDisplayPosition - SNARE_CASE_HIT_TIMES[0] + SNARE_CASE_DURATION
  ) % SNARE_CASE_DURATION
  const activeSnareHitIndex = Math.min(
    SNARE_CASE_HIT_TIMES.length - 1,
    Math.floor(snareHitPhase / snareHitInterval),
  )
  const activeSnareHitNumber = activeSnareHitIndex + 1
  const activeBusEqVariant = activeSnareHitNumber % 2 === 0 ? 'even' : 'odd'
  const routingSnareHitPhase = (
    displayPosition - SNARE_CASE_HIT_TIMES[0] + SNARE_CASE_DURATION
  ) % SNARE_CASE_DURATION
  const activeRoutingHitNumber = Math.min(
    SNARE_CASE_HIT_TIMES.length,
    Math.floor(routingSnareHitPhase / snareHitInterval) + 1,
  )
  const activeRoutingVariant = activeRoutingHitNumber % 2 === 0 ? 'even' : 'odd'
  const secondsLabel = `${Math.floor(position / 60).toString().padStart(2, '0')}:${Math.floor(position % 60).toString().padStart(2, '0')}`
  const scanPlayheads = position > 0 || isPlaying
    ? SNARE_CASE_HIT_TIMES.flatMap((hitTime, hitIndex) => (
        [-SNARE_CASE_DURATION, 0, SNARE_CASE_DURATION].map(cycleOffset => {
          const occurrence = hitTime + cycleOffset
          const scanStart = occurrence - SNARE_CASE_SCAN_PREROLL
          const scanEnd = occurrence + SNARE_CASE_SCAN_TAIL_DURATION
          if (position < scanStart || position >= scanEnd) return null
          const progress = position <= occurrence
            ? (position - scanStart) / SNARE_CASE_SCAN_PREROLL * SNARE_CASE_PEAK_POSITION
            : SNARE_CASE_PEAK_POSITION + (position - occurrence) / SNARE_CASE_SCAN_TAIL_DURATION * (1 - SNARE_CASE_PEAK_POSITION)
          return { key: `${hitIndex}-${cycleOffset}`, progress: Math.max(0, Math.min(1, progress)) }
        })
      )).filter(Boolean)
    : []

  return <section className="snare-case-section" id="snare-process" data-drum-playback-section aria-labelledby="snare-case-title">
    <div className="drum-daw-heading snare-case-heading">
      <div><span>02 / SNARE LAYERING & PROCESSING</span><h2 id="snare-case-title">多层合成一个声音</h2></div>
      <p>以 Snare 1 为例：让不同 Snare Layer 各司其职，对齐瞬态、错开频段，再通过总线进行压缩和均衡处理，并对不同拍点进行空间设计，将多个 Layer 融合成一个完整的声音</p>
    </div>

    <div className="snare-case-frame">
      <div className="drum-transport snare-case-transport">
        <button type="button" className="drum-play-button" data-drum-playback onClick={togglePlayback} disabled={audioLoadState !== 'ready' || (audibleLayerIds.size === 0 && !othersEnabled)} aria-label={audioLoadState === 'loading' ? 'Snare 1 音频加载中' : isPlaying ? '暂停 Snare 1 处理演示' : '播放 Snare 1 处理演示'}>
          {isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
        </button>
        <div className="drum-transport-status"><span>{audioLoadState === 'loading' ? 'LOADING AUDIO' : audioLoadState === 'error' ? 'AUDIO ERROR' : isPlaying ? 'PLAYING' : position > 0 ? 'PAUSED' : 'READY'}</span><strong>{secondsLabel}</strong></div>
        <div className="drum-position-readout"><span>BAR</span><strong>{currentBar}.{currentBeat}</strong></div>
        <div className="drum-session-stat"><span>TEMPO</span><strong>{DRUM_LAYERING_BPM}<small>BPM</small></strong></div>
        <div className="drum-session-stat"><span>METER</span><strong>4 / 4</strong></div>
        <div className="drum-session-stat"><span>LENGTH</span><strong>{SNARE_CASE_BARS}<small>BARS</small></strong></div>
      </div>

      <div className="snare-case-steps">
        <article className="snare-case-step snare-step-one">
          <header className="snare-step-head"><span>STEP 01</span><div><h3>选层与瞬态对齐</h3><p>三层 layer 分别负责 body、attack 和 air；让最强瞬态落在同一点，避免叠加后失焦。</p></div></header>
          <div className="snare-step-one-grid">
            <div className="snare-layer-selector" aria-label="Snare 1 声音层">
              <div className="snare-layer-toolbar"><span>LAYERS</span><button type="button" onClick={enableAllLayers}>ALL ON</button></div>
              {snareCaseLayers.map(layer => {
                const muted = mutedLayers.has(layer.id)
                const soloed = soloedLayers.has(layer.id)
                const audible = audibleLayerIds.has(layer.id)
                return <div className={`snare-layer-row${audible ? ' is-enabled' : ''}`} key={layer.id}>
                  <span className="snare-layer-copy"><small>{layer.no}</small><strong>{layer.label}</strong><em>{layer.role}</em></span>
                  <span className="drum-channel-actions snare-layer-actions">
                    <DrumLayeringMute label={layer.label} muted={muted} onToggle={() => toggleLayerMute(layer.id)} />
                    <DrumLayeringSolo label={layer.label} soloed={soloed} onToggle={() => toggleLayerSolo(layer.id)} />
                  </span>
                  <span className="snare-layer-mini-wave" aria-hidden="true"><svg viewBox="0 0 319 100" preserveAspectRatio="none"><path d={waveformPaths.get(layer.id)} /></svg></span>
                </div>
              })}
            </div>
            <div className="snare-alignment-panel">
              <div className="snare-panel-toolbar"><span>TRANSIENT ALIGNMENT</span><div role="group" aria-label="瞬态对齐比较"><button type="button" className={alignmentMode === 'loose' ? 'is-active' : ''} aria-pressed={alignmentMode === 'loose'} onClick={() => setSnareAlignmentMode('loose')}>起点对齐</button><button type="button" className={alignmentMode === 'aligned' ? 'is-active' : ''} aria-pressed={alignmentMode === 'aligned'} onClick={() => setSnareAlignmentMode('aligned')}>峰值对齐</button></div></div>
              <div className={`snare-alignment-view is-${alignmentMode}${isPlaying ? ' is-playing' : ''}`}>
                {alignmentMode === 'aligned' && <span className="snare-transient-guide-track" aria-hidden="true"><i><span>PEAK</span></i></span>}
                <span className="snare-alignment-playhead-track" aria-hidden="true">
                  {scanPlayheads.map(playhead => <i key={playhead.key} style={{ left: `${playhead.progress * 100}%` }} />)}
                </span>
                {snareCaseLayers.map(layer => <div className={`snare-align-row${audibleLayerIds.has(layer.id) ? '' : ' is-disabled'}`} key={layer.id}>
                  <span>{layer.no}</span><div className="snare-align-wave" style={{ '--aligned-offset': `${layer.alignment.aligned.percent}%`, '--loose-offset': `${layer.alignment.loose.percent}%` }}><svg viewBox="0 0 319 100" preserveAspectRatio="none" aria-hidden="true"><line className="snare-align-zero" x1="0" y1="50" x2="319" y2="50" /><path d={waveformPaths.get(layer.id)} /></svg></div>
                </div>)}
              </div>
              <p className="snare-panel-note"><b>{alignmentMode === 'aligned' ? 'PEAK ALIGNED' : 'START ALIGNED'}</b>{alignmentMode === 'aligned' ? '三条波形的主瞬态共享同一条竖线，attack 更集中，能量瞬间爆发并同步释放。' : '每层采样的起点对齐，但主瞬态分开，attack 松散，且能量不集中。'}</p>
            </div>
          </div>
        </article>

        <article className="snare-case-step">
          <header className="snare-step-head"><span>STEP 02</span><div><h3>EQ 频段避让</h3><p>为每层留出职责明确的空间，让 body、attack 与 air 各占其位，减少叠加时的频段冲突。</p></div><button type="button" className={`snare-case-switch${allEqEnabled ? ' is-on' : anyEqEnabled ? ' is-mixed' : ''}`} aria-pressed={allEqEnabled ? true : anyEqEnabled ? 'mixed' : false} onClick={toggleAllEq}><span>{allEqEnabled ? 'ON' : anyEqEnabled ? 'MIX' : 'OFF'}</span><i /></button></header>
          <div className="snare-eq-grid">
            {snareCaseLayers.map(layer => {
              const enabled = enabledEqLayers.has(layer.id)
              return <div className={`snare-eq-card${enabled ? ' is-enabled' : ' is-bypassed'}`} key={layer.id}>
                <div className="snare-eq-card-head">
                  <small>{layer.no}</small><strong>{layer.label}</strong><em>{layer.role}</em>
                  <button type="button" className="snare-eq-power" aria-label={`${enabled ? '关闭' : '开启'} ${layer.label} EQ`} aria-pressed={enabled} onClick={() => toggleLayerEq(layer.id)}><ShutDownLineIcon size={16} /></button>
                </div>
                <SnareEqCurve layerId={layer.id} />
                <div className="snare-eq-frequency-axis" aria-hidden="true">
                  {['20', '50', '100', '200', '500', '1k', '2k', '5k', '10k', '20k'].map(label => <span key={label}>{label}</span>)}
                </div>
              </div>
            })}
          </div>
        </article>

        <article className="snare-case-step">
          <header className="snare-step-head"><span>STEP 03</span><div><h3>总线统一包络与均衡</h3><p>三层汇入同一条 Snare Bus：用轻度压缩统一动态包络，把三层“粘”成一次 hit；再以整体 EQ 塑造最终音色。</p></div><button type="button" className={`snare-case-switch${allStepThreeEnabled ? ' is-on' : anyStepThreeEnabled ? ' is-mixed' : ''}`} aria-pressed={allStepThreeEnabled ? true : anyStepThreeEnabled ? 'mixed' : false} onClick={toggleAllStepThree}><span>{allStepThreeEnabled ? 'ON' : anyStepThreeEnabled ? 'MIX' : 'OFF'}</span><i /></button></header>
          <div className="snare-compressor-board">
            <div className={`snare-compressor-module${compressorEnabled ? ' is-enabled' : ' is-bypassed'}`}>
              <div className="snare-compressor-title"><div><span>BUS COMPRESSOR</span><small>动态包络统一</small></div><button type="button" className="snare-eq-power" aria-label={`${compressorEnabled ? '关闭' : '开启'} Bus Compressor`} aria-pressed={compressorEnabled} onClick={toggleCompressor}><ShutDownLineIcon size={16} /></button></div>
              <div className="snare-compressor-meter"><span>GAIN REDUCTION</span><div><i style={{ '--gain-reduction': gainReductionProgress }} /></div><b>{gainReductionLabel} dB</b></div>
              <div className="snare-compressor-params"><span><small>THRESHOLD</small><b>−15 dB</b></span><span><small>RATIO</small><b>1.5 : 1</b></span><span><small>ATTACK</small><b>10 ms</b></span><span><small>RELEASE</small><b>100 ms</b></span><span><small>MAKE UP</small><b>1.5 dB</b></span></div>
            </div>
            <div className={`snare-bus-eq-module${busEqEnabled ? ' is-enabled' : ' is-bypassed'}`}>
              <div className="snare-compressor-title"><div><span>BUS EQ</span><small>整体音色平衡</small></div><button type="button" className="snare-eq-power" aria-label={`${busEqEnabled ? '关闭' : '开启'} Bus EQ`} aria-pressed={busEqEnabled} onClick={toggleBusEq}><ShutDownLineIcon size={16} /></button></div>
              <SnareBusEqCurve variant={activeBusEqVariant} hitNumber={activeSnareHitNumber} />
            </div>
          </div>
        </article>

        <article className="snare-case-step snare-effects-step">
          <header className="snare-step-head"><span>STEP 04</span><div><h3>按拍点分配空间效果</h3><p>奇数 hit 通过大厅混响与延迟向后延伸，偶数 hit 使用更短、更近的房间混响，形成远近交替的层次。</p></div><button type="button" className={`snare-case-switch${allEffectsEnabled ? ' is-on' : anyEffectsEnabled ? ' is-mixed' : ''}`} aria-pressed={allEffectsEnabled ? true : anyEffectsEnabled ? 'mixed' : false} onClick={toggleAllEffects}><span>{allEffectsEnabled ? 'ON' : anyEffectsEnabled ? 'MIX' : 'OFF'}</span><i /></button></header>
          <div className={`snare-routing-board${anyEffectsEnabled ? '' : ' is-bypassed'}`}>
            <div className="snare-routing-source"><small>FROM</small><strong>SNARE BUS</strong></div>
            <div className="snare-route-map">
              <i className="snare-route-line" aria-hidden="true" />
              <div className={`snare-route-branch is-odd${isPlaying && activeRoutingVariant === 'odd' ? ' is-current' : ''}`}><div><span>ODD HIT</span><b>SEND</b></div><section>
                <div className={`snare-route-effect-card${enabledEffects.has('chamber') ? ' is-enabled' : ' is-bypassed'}`}><span>BUS A<strong>CHAMBER REVERB</strong><small>深远空间</small></span><button type="button" className="snare-eq-power" aria-label={`${enabledEffects.has('chamber') ? '关闭' : '开启'} Chamber`} aria-pressed={enabledEffects.has('chamber')} onClick={() => toggleEffect('chamber')}><ShutDownLineIcon size={16} /></button></div>
                <div className={`snare-route-effect-card${enabledEffects.has('delay') ? ' is-enabled' : ' is-bypassed'}`}><span>BUS B<strong>1/16 DELAY</strong><small>节奏延伸</small></span><button type="button" className="snare-eq-power" aria-label={`${enabledEffects.has('delay') ? '关闭' : '开启'} Delay`} aria-pressed={enabledEffects.has('delay')} onClick={() => toggleEffect('delay')}><ShutDownLineIcon size={16} /></button></div>
              </section></div>
              <div className={`snare-route-branch is-even${isPlaying && activeRoutingVariant === 'even' ? ' is-current' : ''}`}><div><span>EVEN HIT</span><b>INSERT</b></div><section><div className={`snare-route-effect-card${enabledEffects.has('room') ? ' is-enabled' : ' is-bypassed'}`}><span>CHANNEL FX<strong>ROOM REVERB</strong><small>近场空间</small></span><button type="button" className="snare-eq-power" aria-label={`${enabledEffects.has('room') ? '关闭' : '开启'} Room`} aria-pressed={enabledEffects.has('room')} onClick={() => toggleEffect('room')}><ShutDownLineIcon size={16} /></button></div></section></div>
            </div>
            <div className="snare-routing-output"><small>RETURN</small><strong>MIX</strong></div>
          </div>
        </article>

        <article className="snare-case-step snare-context-step">
          <header className="snare-step-head"><span>STEP 05</span><div><h3>和其他乐器搭配</h3><p>加入人声和其他乐器，对比 Snare 在完整编曲语境中的听感。</p></div><button type="button" className={`snare-case-switch${othersEnabled ? ' is-on' : ''}`} aria-pressed={othersEnabled} aria-label={`${othersEnabled ? '关闭' : '开启'}其他乐器`} onClick={toggleOthers}><span>{othersEnabled ? 'ON' : 'OFF'}</span><i /></button></header>
        </article>
      </div>
    </div>
  </section>
}

function DrumLayeringPage() {
  const prefersReducedMotion = useReducedMotion()
  const [expandedStacks, setExpandedStacks] = useState(() => new Set())
  const [mutedItems, setMutedItems] = useState(() => new Set(['vocal', 'others']))
  const [soloedItems, setSoloedItems] = useState(() => new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [audioLoadState, setAudioLoadState] = useState('loading')
  const [waveformPaths, setWaveformPaths] = useState(() => new Map())
  const audioContextRef = useRef(null)
  const sessionBuffersRef = useRef(new Map())
  const activeSourcesRef = useRef([])
  const gainNodesRef = useRef(new Map())
  const positionRef = useRef(0)
  const animationFrameRef = useRef(0)
  const timelineRulerRef = useRef(null)
  const isSeekingRef = useRef(false)
  const startedAtRef = useRef(0)
  const playbackOffsetRef = useRef(0)

  const scrollToDrumSection = (event, sectionId) => {
    event.preventDefault()
    document.getElementById(sectionId)?.scrollIntoView({
      block: 'start',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  const scrollToDrumTop = event => {
    event.preventDefault()
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  const toggleExpanded = id => {
    setExpandedStacks(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const trackIsAudible = (trackId, nextMutedItems = mutedItems, nextSoloedItems = soloedItems) => {
    const parentId = drumLayeringTrackParents.get(trackId)
    const muted = nextMutedItems.has(trackId) || nextMutedItems.has(parentId)
    const parentHasSoloedTracks = parentId && [...nextSoloedItems].some(itemId => (
      drumLayeringTrackParents.get(itemId) === parentId
    ))
    const includedBySolo = nextSoloedItems.has(trackId) || (
      nextSoloedItems.has(parentId) && !parentHasSoloedTracks
    )
    return !muted && (!nextSoloedItems.size || includedBySolo)
  }

  const applySessionMix = (nextMutedItems, nextSoloedItems) => {
    const context = audioContextRef.current
    gainNodesRef.current.forEach((gain, trackId) => {
      rampGainImmediately(gain.gain, trackIsAudible(trackId, nextMutedItems, nextSoloedItems) ? 1 : 0, context)
    })
  }

  const toggleMuted = id => {
    const nextMutedItems = new Set(mutedItems)
    if (nextMutedItems.has(id)) nextMutedItems.delete(id)
    else nextMutedItems.add(id)
    applySessionMix(nextMutedItems, soloedItems)
    setMutedItems(nextMutedItems)
  }

  const toggleSoloed = id => {
    const nextSoloedItems = new Set(soloedItems)
    if (nextSoloedItems.has(id)) nextSoloedItems.delete(id)
    else nextSoloedItems.add(id)
    applySessionMix(mutedItems, nextSoloedItems)
    setSoloedItems(nextSoloedItems)
  }

  const stopSources = () => {
    activeSourcesRef.current.forEach(source => {
      try { source.stop() } catch { /* Source may already be stopped. */ }
      source.disconnect()
    })
    activeSourcesRef.current = []
    gainNodesRef.current.clear()
  }

  const startSources = () => {
    const context = audioContextRef.current
    if (!context || audioLoadState !== 'ready') return false

    isSeekingRef.current = false
    window.cancelAnimationFrame(animationFrameRef.current)
    stopSources()
    const resumePromise = context.resume()
    const offset = positionRef.current % DRUM_LAYERING_DURATION
    const startsAt = context.currentTime
    drumLayeringTracks.forEach(track => {
      const sessionBuffer = sessionBuffersRef.current.get(track.id)
      if (!sessionBuffer) return
      const source = context.createBufferSource()
      const gain = context.createGain()
      source.buffer = sessionBuffer
      source.loop = true
      source.loopStart = 0
      source.loopEnd = DRUM_LAYERING_DURATION
      gain.gain.value = trackIsAudible(track.id) ? 1 : 0
      source.connect(gain).connect(context.destination)
      source.start(startsAt, offset)
      activeSourcesRef.current.push(source)
      gainNodesRef.current.set(track.id, gain)
    })
    startedAtRef.current = startsAt
    playbackOffsetRef.current = offset
    resumePromise.catch(error => {
      console.warn('[drum-layering] 无法开始播放：', error)
      setIsPlaying(false)
    })

    const update = () => {
      if (!isSeekingRef.current) {
        const elapsed = audiblePlaybackPosition(
          context,
          startedAtRef.current,
          playbackOffsetRef.current,
          DRUM_LAYERING_DURATION,
        )
        positionRef.current = elapsed
        setPosition(elapsed)
      }
      animationFrameRef.current = window.requestAnimationFrame(update)
    }
    animationFrameRef.current = window.requestAnimationFrame(update)
    return true
  }

  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) {
      setAudioLoadState('error')
      return
    }

    let cancelled = false
    const context = new AudioContextClass({ latencyHint: 'interactive' })
    audioContextRef.current = context

    Promise.all(drumLayeringPreloadSources.map(async src => {
      const response = await fetch(src)
      if (!response.ok) throw new Error(`无法加载音频：${src}`)
      const buffer = await context.decodeAudioData(await response.arrayBuffer())
      return [src, buffer]
    })).then(entries => {
      if (cancelled) return
      const buffers = new Map(entries)
      const tracks = drumLayeringTracks
      const clipBuffers = new Map(tracks.filter(track => !track.segments).map(track => (
        [track.id, makeDrumClipBuffer(context, buffers.get(track.src), track)]
      )))
      sessionBuffersRef.current = new Map(tracks.map(track => (
        [track.id, track.segments
          ? makeDrumSegmentedSessionBuffer(context, buffers, track)
          : makeDrumSessionBuffer(context, clipBuffers.get(track.id), track)]
      )))
      setWaveformPaths(new Map(tracks.map(track => (
        [track.id, track.segments
          ? new Map(track.segments.map(segment => [
              segment.id,
              makeDrumWaveformPath(buffers.get(segment.src), 320, segment.bars * DRUM_LAYERING_BAR_DURATION),
            ]))
          : track.hitBeats?.length
            ? makeDrumWaveformPath(buffers.get(track.src), 320, track.hitDurationBeats * 60 / DRUM_LAYERING_BPM)
            : makeDrumWaveformPath(clipBuffers.get(track.id))]
      ))))
      setAudioLoadState('ready')
    }).catch(error => {
      if (cancelled) return
      console.warn('[drum-layering] 音频预加载失败：', error)
      setAudioLoadState('error')
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(animationFrameRef.current)
      stopSources()
      sessionBuffersRef.current.clear()
      context.close().catch(() => {})
      audioContextRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) {
      window.cancelAnimationFrame(animationFrameRef.current)
      stopSources()
    }
  }, [isPlaying])

  const togglePlayback = () => {
    if (audioLoadState !== 'ready') return
    if (isPlaying) {
      window.cancelAnimationFrame(animationFrameRef.current)
      stopSources()
      setIsPlaying(false)
      return
    }
    if (startSources()) setIsPlaying(true)
  }

  const seekToClientX = clientX => {
    const ruler = timelineRulerRef.current
    if (!ruler) return false
    const bounds = ruler.getBoundingClientRect()
    const progress = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width))
    const nextPosition = Math.min(DRUM_LAYERING_DURATION - .001, progress * DRUM_LAYERING_DURATION)
    positionRef.current = nextPosition
    setPosition(nextPosition)
    return true
  }

  const beginSeeking = event => {
    if (event.button !== 0) return
    const ruler = timelineRulerRef.current
    if (!ruler) return
    const bounds = ruler.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right) return
    event.preventDefault()
    isSeekingRef.current = true
    document.documentElement.classList.add('is-drum-seeking')
    event.currentTarget.setPointerCapture(event.pointerId)
    seekToClientX(event.clientX)
  }

  const continueSeeking = event => {
    if (!isSeekingRef.current) return
    seekToClientX(event.clientX)
  }

  const finishSeeking = event => {
    if (!isSeekingRef.current) return
    if (event.type !== 'pointercancel') seekToClientX(event.clientX)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    document.documentElement.classList.remove('is-drum-seeking')
    if (isPlaying) {
      startSources()
    } else {
      isSeekingRef.current = false
    }
  }

  useEffect(() => () => {
    document.documentElement.classList.remove('is-drum-seeking')
  }, [])

  useEffect(() => {
    const onKeyDown = event => {
      if (event.code !== 'Space' || event.repeat) return
      const target = event.target
      if (target instanceof HTMLElement && (
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      )) return
      event.preventDefault()
      event.stopPropagation()

      const viewportCenter = window.innerHeight / 2
      const sections = Array.from(document.querySelectorAll('[data-drum-playback-section]'))
      const currentSection = sections.find(section => {
        const bounds = section.getBoundingClientRect()
        return bounds.top <= viewportCenter && bounds.bottom >= viewportCenter
      }) || sections.reduce((closest, section) => {
        if (!closest) return section
        const bounds = section.getBoundingClientRect()
        const closestBounds = closest.getBoundingClientRect()
        const distance = Math.abs((bounds.top + bounds.bottom) / 2 - viewportCenter)
        const closestDistance = Math.abs((closestBounds.top + closestBounds.bottom) / 2 - viewportCenter)
        return distance < closestDistance ? section : closest
      }, null)

      const playbackButton = currentSection?.querySelector('[data-drum-playback]')
      if (!playbackButton) return
      playbackButton.click()
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

  const returnToArrangement = event => {
    event.preventDefault()
    try {
      sessionStorage.setItem(RETURN_TO_ARRANGEMENT_KEY, 'blank-space')
    } catch {
      // The hash navigation still works when storage is unavailable.
    }
    window.location.hash = 'works'
  }

  const displayPosition = Math.min(position, DRUM_LAYERING_DURATION - .001)
  const currentBar = Math.min(DRUM_LAYERING_BARS, Math.floor(displayPosition / DRUM_LAYERING_BAR_DURATION) + 1)
  const currentBeat = Math.min(DRUM_LAYERING_BEATS, Math.floor((displayPosition % DRUM_LAYERING_BAR_DURATION) / (60 / DRUM_LAYERING_BPM)) + 1)
  const secondsLabel = `${Math.floor(position / 60).toString().padStart(2, '0')}:${Math.floor(position % 60).toString().padStart(2, '0')}`
  const playheadProgress = Math.min(100, position / DRUM_LAYERING_DURATION * 100)

  return <section className="drum-layering-detail" aria-labelledby="drum-layering-title">
    <header className="drum-layering-hero">
      <div className="drum-detail-nav">
        <a href="#works" onClick={returnToArrangement}><ChevronLeft size={18} /> 返回</a>
        <nav aria-label="Drum Layering 页面章节">
          <a href="#drum-session" onClick={event => scrollToDrumSection(event, 'drum-session')}>多组 Drum 的叠加效果</a>
          <a href="#snare-process" onClick={event => scrollToDrumSection(event, 'snare-process')}>多层合成一个声音</a>
        </nav>
      </div>
      <div className="drum-hero-grid">
        <div>
          <p className="drum-layering-kicker">BLANK SPACE · TAYLOR SWIFT</p>
          <h1 id="drum-layering-title">Drum Layering<span>.</span></h1>
        </div>
        <p className="drum-layering-lead">多个互补的鼓采样层，塑造干脆有力的鼓组质感。多个鼓组叠加混合，还原《Blank Space》鼓声的冲击力与生命力。</p>
      </div>
    </header>

    <section className="drum-daw-section" id="drum-session" data-drum-playback-section aria-label="Drum Layering 交互时间线">
      <div className="drum-daw-heading">
        <div><span>01 / MULTIPLE-DRUM ARRANGEMENT</span><h2>多组 Drum 的叠加</h2></div>
        <p>多组鼓组的叠加营造了强烈的冲击感和节奏感。在时间线上查看各鼓组 layer 的排列方式，并自由开关试听。</p>
      </div>

      <div className="drum-daw">
        <div className="drum-transport">
          <button type="button" className="drum-play-button" data-drum-playback onClick={togglePlayback} disabled={audioLoadState !== 'ready'} aria-label={audioLoadState === 'loading' ? '音频加载中' : isPlaying ? '暂停' : '播放'}>
            {isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
          </button>
          <div className="drum-transport-status"><span>{audioLoadState === 'loading' ? 'LOADING AUDIO' : audioLoadState === 'error' ? 'AUDIO ERROR' : isPlaying ? 'PLAYING' : position > 0 ? 'PAUSED' : 'READY'}</span><strong>{secondsLabel}</strong></div>
          <div className="drum-position-readout"><span>BAR</span><strong>{currentBar}.{currentBeat}</strong></div>
          <div className="drum-session-stat"><span>TEMPO</span><strong>{DRUM_LAYERING_BPM}<small>BPM</small></strong></div>
          <div className="drum-session-stat"><span>METER</span><strong>4 / 4</strong></div>
          <div className="drum-session-stat"><span>LENGTH</span><strong>8<small>BARS</small></strong></div>
        </div>

        <div className="drum-daw-scroll">
          <div
            className="drum-daw-grid"
            onPointerDown={beginSeeking}
            onPointerMove={continueSeeking}
            onPointerUp={finishSeeking}
            onPointerCancel={finishSeeking}
          >
            <div className="drum-daw-corner"><span aria-hidden="true"></span><small>MUTE / SOLO</small></div>
            <div className="drum-ruler" ref={timelineRulerRef} aria-hidden="true">
              {Array.from({ length: DRUM_LAYERING_BARS }, (_, index) => <span key={index}>{index + 1}</span>)}
            </div>
            <div className="drum-playhead-layer" style={{ '--playhead-progress': `${playheadProgress}%` }} aria-hidden="true">
              <i></i><span></span>
            </div>

            {drumLayeringStacks.map(stack => {
              const expanded = expandedStacks.has(stack.id)
              const stackMuted = mutedItems.has(stack.id)
              const stackSoloed = soloedItems.has(stack.id)
              return <React.Fragment key={stack.id}>
                <div className={`drum-stack-label${expanded ? ' is-expanded' : ''}`} style={{ '--stack-color': stack.color }}>
                  <div className="drum-stack-head">
                    <button type="button" className="drum-stack-toggle" onClick={() => toggleExpanded(stack.id)} aria-expanded={expanded}>
                      <ChevronDown size={17} /><span>{stack.label}</span>
                    </button>
                    <div className="drum-channel-actions">
                      <DrumLayeringMute label={stack.label} muted={stackMuted} onToggle={() => toggleMuted(stack.id)} />
                      <DrumLayeringSolo label={stack.label} soloed={stackSoloed} onToggle={() => toggleSoloed(stack.id)} />
                    </div>
                  </div>
                  <div className="drum-stack-expand-shell" aria-hidden={!expanded}>
                    <div className="drum-stack-expand-content">
                      {stack.tracks.length
                        ? stack.tracks.map(track => <div className="drum-track-label" key={track.id}>
                          <span>{track.label}</span>
                          <div className="drum-channel-actions">
                            <DrumLayeringMute label={track.label} muted={mutedItems.has(track.id)} onToggle={() => toggleMuted(track.id)} />
                            <DrumLayeringSolo label={track.label} soloed={soloedItems.has(track.id)} onToggle={() => toggleSoloed(track.id)} />
                          </div>
                        </div>)
                        : <div className="drum-empty-label">素材待加入</div>}
                    </div>
                  </div>
                </div>

                <div className={`drum-stack-timeline${expanded ? ' is-expanded' : ''}${stackMuted ? ' is-muted' : ''}`}>
                  <div className="drum-stack-summary-lane" style={{ '--summary-track-count': Math.max(1, stack.tracks.length) }}>
                    {!expanded && stack.tracks.map(track => <div className={`drum-stack-summary-track${mutedItems.has(track.id) ? ' is-muted' : ''}`} key={track.id}>
                      <DrumTrackClips track={track} color={stack.color} waveformPath={waveformPaths.get(track.id)} subdued compact />
                    </div>)}
                  </div>
                  <div className="drum-stack-expand-shell" aria-hidden={!expanded}>
                    <div className="drum-stack-expand-content">
                      {stack.tracks.length
                        ? stack.tracks.map(track => <div className={`drum-track-lane${mutedItems.has(track.id) ? ' is-muted' : ''}`} key={track.id}>
                          <DrumTrackClips track={track} color={stack.color} waveformPath={waveformPaths.get(track.id)} />
                        </div>)
                        : <div className="drum-empty-lane"><span>DROP AUDIO HERE</span></div>}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            })}

            {drumLayeringStandaloneTracks.map(track => {
              const trackMuted = mutedItems.has(track.id)
              const trackSoloed = soloedItems.has(track.id)
              return <React.Fragment key={track.id}>
                <div className="drum-stack-label drum-standalone-label" style={{ '--stack-color': track.color }}>
                  <div className="drum-stack-head">
                    <span className="drum-standalone-name">{track.label}</span>
                    <div className="drum-channel-actions">
                      <DrumLayeringMute label={track.label} muted={trackMuted} onToggle={() => toggleMuted(track.id)} />
                      <DrumLayeringSolo label={track.label} soloed={trackSoloed} onToggle={() => toggleSoloed(track.id)} />
                    </div>
                  </div>
                </div>
                <div className={`drum-stack-timeline drum-standalone-timeline${trackMuted ? ' is-muted' : ''}`}>
                  <div className="drum-track-lane">
                    <DrumTrackClips track={track} color={track.color} waveformPath={waveformPaths.get(track.id)} />
                  </div>
                </div>
              </React.Fragment>
            })}
          </div>
        </div>

      </div>
    </section>
    <SnareLayeringCaseStudy timelinePlaying={isPlaying} onPlaybackStart={() => setIsPlaying(false)} />
    <footer className="drum-detail-footer"><span>BLANK SPACE DRUM LAYERING · AUGUST REMAKE</span><a href="#drum-layering" onClick={scrollToDrumTop}>BACK TO TOP ↑</a></footer>
  </section>
}

function StrengthStory({ no, tone, kicker, title, lead, points, image, imageAlt, note, noteLink, withFooter = false, educationReveal = false }) {
  const revealRef = useEducationReveal('campus', educationReveal)
  return <article className={`strength-story ${tone}${withFooter ? ' has-footer' : ''}`} ref={revealRef}>
    <div className="story-inner">
      <header className="story-header"><span className="story-no">{no}</span><p className="mini">{kicker}</p></header>
      <div className="story-heading"><h3>{title}</h3><p>{lead}</p></div>
      <div className="story-points">
        {points.map(point => <div className="story-point" key={point.label}><span>{point.label}</span><strong>{point.value}</strong><p>{point.text}</p></div>)}
      </div>
      {image && <figure className="story-photo"><img src={image} alt={imageAlt || ''} /></figure>}
      {note && <p className="story-note">{note}{noteLink && <> <a className="story-note-link" href={noteLink.href}>{noteLink.label}<span aria-hidden="true">↗</span></a></>}</p>}
    </div>
    {withFooter && <footer className="education-footer"><span>© 2026 AUGUST PEI</span><a className="contact-back-home" href="#home">BACK TO HOME <span aria-hidden="true">↑</span></a></footer>}
  </article>
}

function EducationAIStory({ no, tone, kicker, title, lead }) {
  const revealRef = useEducationReveal('research')
  const researchTags = ['AIGC', 'MLLM', 'Diffusion', 'Image Editing']
  const practiceItems = [
    ['掌纹图像生成', '探索掌纹纹理保持的可控生成方法，生成百万级别掌纹图像，改进生成质量与多样性，提升了模型在掌纹识别任务的性能。'],
    ['生成质量评估', '使用“定量+定性”的生成质量评估机制：设计评估指标与自动化分析工具，定位生成中的问题；结合人工评估，培养对生成内容质量的敏感度与评价能力。'],
    ['AI Agent 工作流', '使用 WorkBuddy 搭建自动化研究与实验流程，培养利用 Agent 解决实际问题的能力，显著提升研发效率。'],
  ]

  return <article className={`strength-story education-ai-story ${tone}`} ref={revealRef}>
    <div className="story-inner ai-story-inner">
      <header className="story-header"><span className="story-no">{no}</span><p className="mini">{kicker}</p></header>
      <div className="story-heading ai-story-heading"><h3>{title}</h3><p>{lead}</p></div>

      <section className="ai-research-band" aria-labelledby="ai-research-title">
        <span className="ai-block-kicker">RESEARCH FOCUS</span>
        <div className="ai-research-main">
          <h4 id="ai-research-title">研究方向：AIGC × 多模态</h4>
          <div className="ai-research-tags" aria-label="研究关键词">
            {researchTags.map(tag => <span key={tag}>{tag}</span>)}
          </div>
        </div>
        <p>研究方向覆盖 AIGC、多模态大模型、Diffusion、图像生成与编辑，关注结构保持与可控性、生成质量的评估。</p>
      </section>

      <div className="ai-feature-grid">
        <section className="ai-publication" aria-labelledby="snr-edit-title">
          <span className="ai-block-kicker">FEATURED PUBLICATION</span>
          <div className="ai-publication-title-row">
            <h4 id="snr-edit-title">代表作：SNR-Edit</h4>
            <div className="ai-publication-links" aria-label="SNR-Edit 资源链接">
              <a href="https://openreview.net/pdf?id=fbhXjmmrgm" target="_blank" rel="noreferrer">
                <img src="/icons/arxiv.svg" alt="" aria-hidden="true" />
                <span>Paper</span>
              </a>
              <a href="https://github.com/Tankowa/SNR-Edit-Accepted-by-ACM-MM-2026" target="_blank" rel="noreferrer">
                <img src="/icons/github.svg" alt="" aria-hidden="true" />
                <span>Code</span>
              </a>
            </div>
          </div>
          <h5>Structure-Aware Noise Rectification for<br/>Inversion-Free Flow-Based Editing</h5>
          <div className="ai-publication-meta"><span>ACM Multimedia 2026</span><b>ACCEPTED</b></div>
          <p>提出一种无需反演的 Flow 模型图像编辑方法，将 SAM 掩码结构信息注入到初始噪声，改进了图像编辑的结构保持能力。</p>
          <figure className="ai-paper-figure">
            <ZoomImage src="/education/SNR-Edit.webp" width="2000" height="1102" alt="SNR-Edit 图像编辑结果示例" zoomScale={2.2} />
            <figcaption>SNR-Edit 模型的图像编辑可视化结果，该方法在不同图像编辑操作中都展现出更强的结构保持性。</figcaption>
          </figure>
        </section>

        <aside className="ai-practice" aria-labelledby="ai-practice-title">
          <span className="ai-block-kicker">PRACTICE EXPERIENCE</span>
          <h4 id="ai-practice-title">腾讯优图实验室</h4>
          <p className="ai-practice-role">图像生成算法实习生</p>
          <p className="ai-practice-lead">参与百万级掌纹图像生成、质量评估与问题定位，并使用 AI Agent 优化研究与工程工作流。</p>
          <div className="ai-practice-list">
            {practiceItems.map(([heading, text], index) => <div key={heading}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{heading}</strong><p>{text}</p></div>
            </div>)}
          </div>
        </aside>
      </div>
    </div>
  </article>
}

function EducationLearningStory({ no, tone, kicker, title, lead }) {
  const revealRef = useEducationReveal('learning')
  const courseListRef = useRef(null)
  const hasRenderedCourseList = useRef(false)
  const categories = Object.keys(courseRecords)
  const [activeCategory, setActiveCategory] = useState(categories[0])

  useLayoutEffect(() => {
    if (!hasRenderedCourseList.current) {
      hasRenderedCourseList.current = true
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const rows = [...courseListRef.current.querySelectorAll('.course-row')]
    const animations = rows.map((row, index) => {
      row.style.opacity = '0'
      row.style.filter = 'blur(12px)'
      row.style.transform = 'translateY(10px)'
      const animation = row.animate([
        { opacity: 0, filter: 'blur(12px)', transform: 'translateY(10px)' },
        { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0px)' },
      ], {
        duration: 520,
        delay: index * 65,
        easing: 'cubic-bezier(.22, 1, .36, 1)',
        fill: 'forwards',
      })
      animation.onfinish = () => {
        row.style.removeProperty('opacity')
        row.style.removeProperty('filter')
        row.style.removeProperty('transform')
        animation.cancel()
      }
      return animation
    })
    return () => {
      animations.forEach(animation => animation.cancel())
      rows.forEach(row => {
        row.style.removeProperty('opacity')
        row.style.removeProperty('filter')
        row.style.removeProperty('transform')
      })
    }
  }, [activeCategory])

  return <article className={`strength-story education-learning-story ${tone}`} ref={revealRef}>
    <div className="story-inner">
      <header className="story-header"><span className="story-no">{no}</span><p className="mini">{kicker}</p></header>
      <div className="story-heading education-learning-heading"><h3>{title}</h3><p>{lead}</p></div>
      <div className="education-learning-content">
        <div className="education-learning-metrics" aria-label="核心学业数据">
          <div><strong>3.98<sup>/4.0</sup></strong><span>本科 GPA</span></div>
          <div><strong>01<sup>/85</sup></strong><span>专业排名</span></div>
          <div><strong>2<sup>次</sup></strong><span>国家奖学金</span></div>
        </div>
        <div className="course-records">
          <div className="course-records-head">
            <div><span>SELECTED COURSES</span><h4>专业课程成绩</h4></div>
            <div className="course-tabs" role="tablist" aria-label="课程类别">
              {categories.map(category => <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                className={activeCategory === category ? 'active' : ''}
                onClick={() => setActiveCategory(category)}
              >{category}</button>)}
            </div>
          </div>
          <div className="course-list" ref={courseListRef} role="tabpanel" aria-label={`${activeCategory}课程成绩`}>
            <div className="course-table-head" aria-hidden="true"><span>#</span><span>课程名称</span><span>成绩</span></div>
            {courseRecords[activeCategory].map(([course, score], index) => <div className="course-row" key={course}>
              <span>{String(index + 1).padStart(2, '0')}</span><b>{course}</b><strong>{score}</strong>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  </article>
}

function AlbumWall() {
  const viewportRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => {
    const viewport = viewportRef.current
    const grid = gridRef.current
    if (!viewport || !grid) return

    const position = { x: 0, y: 0 }
    const velocity = { x: 0, y: 0 }
    const pointer = { id: null, x: 0, y: 0, time: 0 }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let hasMoved = false
    let initialized = false

    const bounds = () => {
      const padding = Math.min(120, viewport.clientWidth * .08)
      return {
        minX: Math.min(padding, viewport.clientWidth - grid.offsetWidth - padding),
        maxX: padding,
        minY: Math.min(padding, viewport.clientHeight - grid.offsetHeight - padding),
        maxY: padding,
      }
    }

    const render = (tilt = 0) => {
      grid.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) rotate(${tilt}deg)`
    }

    const center = () => {
      if (initialized && hasMoved) return
      position.x = (viewport.clientWidth - grid.offsetWidth) / 2
      position.y = (viewport.clientHeight - grid.offsetHeight) / 2
      render()
      initialized = true
    }

    const resist = (value, min, max) => {
      if (value < min) return min + (value - min) * .16
      if (value > max) return max + (value - max) * .16
      return value
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    const settle = () => {
      stop()
      const animate = () => {
        const limit = bounds()
        velocity.x *= reducedMotion ? 0 : .93
        velocity.y *= reducedMotion ? 0 : .93
        position.x += velocity.x
        position.y += velocity.y

        if (position.x < limit.minX) velocity.x += (limit.minX - position.x) * .055
        if (position.x > limit.maxX) velocity.x += (limit.maxX - position.x) * .055
        if (position.y < limit.minY) velocity.y += (limit.minY - position.y) * .055
        if (position.y > limit.maxY) velocity.y += (limit.maxY - position.y) * .055

        render(velocity.x * .008)
        const outside = position.x < limit.minX - .5 || position.x > limit.maxX + .5 || position.y < limit.minY - .5 || position.y > limit.maxY + .5
        if (Math.abs(velocity.x) + Math.abs(velocity.y) > .35 || outside) {
          frame = requestAnimationFrame(animate)
        } else {
          position.x = Math.max(limit.minX, Math.min(limit.maxX, position.x))
          position.y = Math.max(limit.minY, Math.min(limit.maxY, position.y))
          render()
          frame = 0
        }
      }
      frame = requestAnimationFrame(animate)
    }

    const onPointerDown = event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      stop()
      pointer.id = event.pointerId
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.time = performance.now()
      velocity.x = 0
      velocity.y = 0
      viewport.setPointerCapture(event.pointerId)
      viewport.classList.add('is-dragging')
    }

    const onPointerMove = event => {
      if (event.pointerId !== pointer.id) return
      const now = performance.now()
      const elapsed = Math.max(8, now - pointer.time)
      const deltaX = event.clientX - pointer.x
      const deltaY = event.clientY - pointer.y
      if (Math.abs(deltaX) + Math.abs(deltaY) > 1) hasMoved = true
      const limit = bounds()
      position.x = resist(position.x + deltaX, limit.minX, limit.maxX)
      position.y = resist(position.y + deltaY, limit.minY, limit.maxY)
      velocity.x = (deltaX / elapsed) * 14
      velocity.y = (deltaY / elapsed) * 14
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.time = now
      render(deltaX * .018)
    }

    const onPointerUp = event => {
      if (event.pointerId !== pointer.id) return
      pointer.id = null
      viewport.classList.remove('is-dragging')
      settle()
    }

    const resizeObserver = new ResizeObserver(center)
    resizeObserver.observe(viewport)
    resizeObserver.observe(grid)
    viewport.addEventListener('pointerdown', onPointerDown)
    viewport.addEventListener('pointermove', onPointerMove)
    viewport.addEventListener('pointerup', onPointerUp)
    viewport.addEventListener('pointercancel', onPointerUp)
    center()

    return () => {
      stop()
      resizeObserver.disconnect()
      viewport.removeEventListener('pointerdown', onPointerDown)
      viewport.removeEventListener('pointermove', onPointerMove)
      viewport.removeEventListener('pointerup', onPointerUp)
      viewport.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  return <section className="album-wall-section editorial-title-reference" aria-labelledby="album-wall-title">
    <header className="album-wall-head editorial-heading-row">
      <div><p className="mini">ALBUMS THAT SHAPED ME</p><h3 id="album-wall-title">启发我的音乐</h3></div>
      <p className="editorial-heading-copy">一些塑造了我对音乐、流行与审美的唱片。<br/><span>按住并拖动，探索整面专辑墙。</span></p>
    </header>
    <div className="album-wall-viewport" ref={viewportRef} aria-label="可拖动的专辑封面墙">
      <div className="album-wall-grid" ref={gridRef}>
        {albumWall.map(album => <div className="album-tile" key={album.id}>
          <TiltedCard
            imageSrc={album.src}
            altText={`${album.title} 专辑封面`}
            captionText={album.title}
            rotateAmplitude={10}
            scaleOnHover={1.07}
            imageLoading="eager"
          />
        </div>)}
      </div>
      <div className="interaction-hint album-drag-hint" aria-hidden="true"><span>DRAG</span><i>↔</i><small>TO EXPLORE</small></div>
    </div>
  </section>
}

function Work({ no, title, artist, tags=[], color, cover, video, active=false, isPlaying=false, onToggle, placeholder=false }) {
  return <article className="work-row">
    <span className="work-no">{no}</span>
    <div className={`cover ${color || ''}`}>
      {cover ? <img src={cover} alt={`${title} 封面`} /> : <div className="wave">||||||||||||</div>}
      {placeholder && <small>COMING SOON</small>}
    </div>
    <div className="work-info">
      <h3>
        <span className={video ? 'work-title-text has-video' : 'work-title-text'}>{title}</span>
        {video && <a className="work-title-link" href={video} target="_blank" rel="noreferrer" aria-label={`观看 ${title} 视频`}>{title}<ArrowUpRight size={18} aria-hidden="true" /></a>}
      </h3>
      <p>{artist}</p>
      <div className="work-tags" aria-label={`${title} 标签`}>{tags.map(tag => <span key={tag}>{tag}</span>)}</div>
    </div>
    <div className="player"><button className={active ? 'is-active' : ''} disabled={placeholder} onClick={onToggle} aria-pressed={active && isPlaying} aria-label={placeholder ? '即将上线' : isPlaying && active ? '暂停' : `播放 ${title}`}>{isPlaying && active ? <Pause/> : <Play/>}</button><div className="player-timeline"><div className="progress"><i style={{width: active ? '100%' : '0%'}}></i></div><span>{placeholder ? 'COMING SOON' : active ? 'NOW SELECTED' : 'READY TO PLAY'}</span></div></div>
    {video ? <a className="video-link" href={video} target="_blank" rel="noreferrer" aria-label={`观看 ${title} 视频`}>VIDEO <ArrowUpRight size={16}/></a> : <span className="video-link is-disabled" aria-disabled="true">VIDEO <ArrowUpRight size={16}/></span>}
  </article>
}

function ArtistMarquee({ artist }) {
  const viewportRef = useRef(null)
  const textRef = useRef(null)
  const [marquee, setMarquee] = useState({ overflow: 0, cycle: 0 })

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const text = textRef.current
    if (!viewport || !text) return

    const measure = () => {
      const cycle = text.scrollWidth + 24
      const overflow = Math.max(0, Math.ceil(text.scrollWidth - viewport.clientWidth))
      setMarquee(previous => previous.overflow === overflow && previous.cycle === cycle ? previous : { overflow, cycle })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(text)
    measure()
    return () => observer.disconnect()
  }, [artist])

  return <span className={`floating-player-artist${marquee.overflow > 0 ? ' is-overflowing' : ''}`} ref={viewportRef}>
    <span className="floating-player-artist-track" style={{ '--artist-cycle': `${marquee.cycle}px`, '--artist-duration': `${Math.max(10, 2.5 + marquee.cycle / 26)}s` }}>
      <span ref={textRef}>{artist}</span>
      <span className="floating-player-artist-repeat" aria-hidden="true">{artist}</span>
    </span>
  </span>
}

function AnimatedPlayerCover({ src, title }) {
  const visualRef = useRef({ shown: src, next: null, phase: 'idle' })
  const [visual, setVisual] = useState(visualRef.current)

  useEffect(() => {
    if (src === visualRef.current.shown && visualRef.current.phase === 'idle') return

    const timers = []
    const update = next => {
      visualRef.current = next
      setVisual(next)
    }
    const schedule = (callback, delay) => timers.push(window.setTimeout(callback, delay))
    const previous = visualRef.current
    const shown = previous.phase === 'crossfading' && previous.next ? previous.next : previous.shown

    if (src === shown || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update({ shown: src, next: null, phase: 'idle' })
      return
    }

    update({ shown, next: null, phase: 'blurring' })
    schedule(() => {
      update({ shown, next: src, phase: 'ready' })
      schedule(() => {
        update({ shown, next: src, phase: 'crossfading' })
        schedule(() => {
          update({ shown: src, next: null, phase: 'revealing' })
          schedule(() => update({ shown: src, next: null, phase: 'idle' }), 180)
        }, 150)
      }, 20)
    }, 110)

    return () => timers.forEach(timer => window.clearTimeout(timer))
  }, [src])

  return <div className={`floating-player-cover is-${visual.phase}`} role="img" aria-label={`${title} 封面`}>
    <img className="floating-player-cover-base" src={visual.shown} alt="" aria-hidden="true" />
    {visual.next && <img className="floating-player-cover-next" src={visual.next} alt="" aria-hidden="true" />}
  </div>
}

function FloatingPlayer({ track, page, isPlaying, currentTime, duration, onToggle, onNext, onSeek, compact, closing, onCompactToggle, onClose }) {
  const playerRef = useRef(null)
  const [surfaceTone, setSurfaceTone] = useState(() => page === 'works' ? 'dark' : 'light')

  useLayoutEffect(() => {
    let frame = 0

    const readBackgroundTone = () => {
      frame = 0
      const player = playerRef.current
      if (!player) return
      const bounds = player.getBoundingClientRect()
      const compactWidth = parseFloat(getComputedStyle(player).getPropertyValue('--player-closed-width')) || bounds.width
      const visibleWidth = compact ? compactWidth : bounds.width
      const sampleX = Math.min(window.innerWidth - 1, Math.max(0, bounds.right - visibleWidth / 2))
      const sampleY = Math.min(window.innerHeight - 1, Math.max(0, bounds.top + bounds.height / 2))
      const layers = document.elementsFromPoint(sampleX, sampleY)
      let background = null

      for (const layer of layers) {
        if (player.contains(layer)) continue
        let node = layer
        while (node && node !== document.documentElement) {
          const color = getComputedStyle(node).backgroundColor
          const match = color.match(/rgba?\(([^)]+)\)/)
          if (match) {
            const values = match[1].split(',').map(Number)
            if (values.length < 4 || values[3] > 0.05) {
              background = values
              break
            }
          }
          node = node.parentElement
        }
        if (background) break
      }

      if (!background) return
      const [red, green, blue] = background
      const luminance = .2126 * red + .7152 * green + .0722 * blue
      setSurfaceTone(tone => {
        const nextTone = luminance < 138 ? 'dark' : 'light'
        return tone === nextTone ? tone : nextTone
      })
    }

    const scheduleToneRead = () => {
      if (frame) return
      frame = requestAnimationFrame(readBackgroundTone)
    }

    readBackgroundTone()
    window.addEventListener('scroll', scheduleToneRead, { passive: true })
    window.addEventListener('resize', scheduleToneRead)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleToneRead)
      window.removeEventListener('resize', scheduleToneRead)
    }
  }, [page, compact])

  const formatTime = seconds => {
    if (!Number.isFinite(seconds)) return '00:00'
    const minutes = Math.floor(seconds / 60)
    const remainder = Math.floor(seconds % 60)
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
  }

  return <aside ref={playerRef} className={`floating-player on-${surfaceTone}${compact ? ' is-compact' : ''}${closing ? ' is-closing' : ''}`} aria-label="音乐播放器">
    <div className="floating-player-surface">
      <AnimatedPlayerCover src={track.cover} title={track.title} />
      <div className="floating-player-main" id="floating-player-details" aria-hidden={compact}>
        <div className="floating-player-copy">
          <strong>{track.title}</strong>
          <ArtistMarquee key={track.artist} artist={track.artist} />
        </div>
        <div className="floating-player-timeline">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={onSeek}
            tabIndex={compact ? -1 : 0}
            aria-label={`${track.title} 播放进度`}
            style={{ '--player-progress': `${duration ? currentTime / duration * 100 : 0}%` }}
          />
          <div><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
        </div>
      </div>
      <div className="floating-player-controls">
        <button className="floating-player-toggle" type="button" onClick={onToggle} aria-label={isPlaying ? '暂停' : '播放'}>
          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>
        <button type="button" onClick={onNext} aria-label="下一首"><SkipForward size={22} fill="currentColor" /></button>
      </div>
      <div className="floating-player-actions">
        <button type="button" onClick={onClose} disabled={closing} aria-label="关闭播放器"><X size={18} /></button>
        <button type="button" onClick={onCompactToggle} aria-label={compact ? '展开播放器' : '收起播放器'} aria-expanded={!compact} aria-controls="floating-player-details">
          {compact ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  </aside>
}

function DitherCursor({ color = '#d8ff45' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const hero = canvas?.parentElement
    if (!canvas || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = canvas.getContext('2d', { alpha: true })
    const cellSize = 5
    const pointCount = 26
    const bayer = [
       0, 48, 12, 60,  3, 51, 15, 63,
      32, 16, 44, 28, 35, 19, 47, 31,
       8, 56,  4, 52, 11, 59,  7, 55,
      40, 24, 36, 20, 43, 27, 39, 23,
       2, 50, 14, 62,  1, 49, 13, 61,
      34, 18, 46, 30, 33, 17, 45, 29,
      10, 58,  6, 54,  9, 57,  5, 53,
      42, 26, 38, 22, 41, 25, 37, 21,
    ]
    const points = Array.from({ length: pointCount }, () => ({ x: 0, y: 0 }))
    let frame = 0
    let pointer = null
    let previousPointer = null
    let speed = 0
    let visible = 0
    let initialized = false
    let lastMoveAt = 0
    let previousTime = performance.now()

    const resize = () => {
      const bounds = hero.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(bounds.width * ratio)
      canvas.height = Math.round(bounds.height * ratio)
      canvas.style.width = `${bounds.width}px`
      canvas.style.height = `${bounds.height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const requestDraw = () => {
      if (!frame) {
        previousTime = performance.now()
        frame = requestAnimationFrame(draw)
      }
    }

    const locate = event => {
      const bounds = hero.getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return

      const next = { x, y }
      if (previousPointer) speed = Math.hypot(next.x - previousPointer.x, next.y - previousPointer.y)
      previousPointer = next
      pointer = next
      lastMoveAt = performance.now()

      if (!initialized) {
        points.forEach(point => Object.assign(point, next))
        initialized = true
      }
      requestDraw()
    }
    const clearPointer = () => { previousPointer = null }

    const draw = now => {
      frame = 0
      const width = hero.clientWidth
      const height = hero.clientHeight
      context.clearRect(0, 0, width, height)

      const delta = Math.min((now - previousTime) / 1000, .05)
      previousTime = now
      const isMoving = now - lastMoveAt < 70
      visible += ((isMoving ? 1 : 0) - visible) * (1 - Math.exp(-delta * (isMoving ? 15 : 5)))
      speed += (0 - speed) * (1 - Math.exp(-delta * 9))

      if (initialized && pointer && visible > .008) {
        const headFollow = 1 - Math.exp(-delta * 24)
        points[0].x += (pointer.x - points[0].x) * headFollow
        points[0].y += (pointer.y - points[0].y) * headFollow

        for (let index = 1; index < points.length; index += 1) {
          const follow = 1 - Math.exp(-delta * (12.5 - index * .22))
          points[index].x += (points[index - 1].x - points[index].x) * follow
          points[index].y += (points[index - 1].y - points[index].y) * follow
        }

        const baseRadius = Math.min(width, height) * .105
        const speedScale = 1 + Math.min(speed / 85, .38)
        const padding = baseRadius * speedScale + cellSize
        let minX = width
        let minY = height
        let maxX = 0
        let maxY = 0

        points.forEach(point => {
          minX = Math.min(minX, point.x - padding)
          minY = Math.min(minY, point.y - padding)
          maxX = Math.max(maxX, point.x + padding)
          maxY = Math.max(maxY, point.y + padding)
        })

        const fromX = Math.max(0, Math.floor(minX / cellSize))
        const toX = Math.min(Math.ceil(width / cellSize), Math.ceil(maxX / cellSize))
        const fromY = Math.max(0, Math.floor(minY / cellSize))
        const toY = Math.min(Math.ceil(height / cellSize), Math.ceil(maxY / cellSize))

        context.fillStyle = color
        context.globalAlpha = .86

        for (let gy = fromY; gy <= toY; gy += 1) {
          const sampleY = gy * cellSize + cellSize / 2
          for (let gx = fromX; gx <= toX; gx += 1) {
            const sampleX = gx * cellSize + cellSize / 2
            let density = 0

            for (let index = 0; index < points.length - 1; index += 1) {
              const start = points[index]
              const end = points[index + 1]
              const dx = end.x - start.x
              const dy = end.y - start.y
              const lengthSquared = dx * dx + dy * dy || 1
              const projection = Math.max(0, Math.min(1, ((sampleX - start.x) * dx + (sampleY - start.y) * dy) / lengthSquared))
              const nearestX = start.x + dx * projection
              const nearestY = start.y + dy * projection
              const tailProgress = (index + projection) / (points.length - 1)
              const taper = Math.pow(1 - tailProgress, .72)
              const radius = baseRadius * speedScale * (.12 + .88 * taper)
              const distance = Math.hypot(sampleX - nearestX, sampleY - nearestY)

              if (distance < radius) {
                density = Math.max(density, Math.pow(1 - distance / radius, .62) * (.35 + .65 * taper))
              }
            }

            density *= visible
            const threshold = (bayer[(gy % 8) * 8 + (gx % 8)] + .5) / 64
            if (density > threshold * .92) {
              const dotSize = density > .78 ? 3 : density > .4 ? 2.5 : 2
              const offset = (cellSize - dotSize) / 2
              context.fillRect(gx * cellSize + offset, gy * cellSize + offset, dotSize, dotSize)
            }
          }
        }
        context.globalAlpha = 1
      }

      if (isMoving || visible > .008) frame = requestAnimationFrame(draw)
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(hero)
    window.addEventListener('pointermove', locate, { passive: true })
    window.addEventListener('pointerleave', clearPointer)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', locate)
      window.removeEventListener('pointerleave', clearPointer)
    }
  }, [color])

  return <canvas ref={canvasRef} className="dither-cursor" aria-hidden="true" />
}

async function loadOverallData() {
  try {
    const dataUrl = import.meta.env.DEV
      ? '/api/overall-data'
      : `${import.meta.env.BASE_URL}overall-data.json`
    const response = await fetch(dataUrl, { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!data?.total) throw new Error('响应缺少 total 字段')
    return data
  } catch (error) {
    console.warn('[overall-data] 使用页面内置回退数据：', error)
    return null
  }
}

loadOverallData().then(initialSocialData => {
  const rootElement = document.getElementById('root')
  rootElement.removeAttribute('aria-busy')
  createRoot(rootElement).render(<App initialSocialData={initialSocialData} />)
})
