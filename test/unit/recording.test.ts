import { describe, expect, it } from 'vitest'
import { coverFit, pickRecordingMimeType, recordingExtension, wrapText } from '../../app/utils/recording'

describe('recording helpers', () => {
  it('prefers MP4 and falls back to WebM', () => {
    expect(pickRecordingMimeType(() => true)).toBe('video/mp4;codecs=avc1')
    expect(pickRecordingMimeType(type => type.startsWith('video/webm'))).toBe('video/webm;codecs=vp9,opus')
    expect(pickRecordingMimeType(() => false)).toBeNull()
    expect(recordingExtension('video/mp4')).toBe('mp4')
    expect(recordingExtension('video/webm;codecs=vp9,opus')).toBe('webm')
  })

  it('wraps text to the width', () => {
    const measure = (text: string) => text.length
    expect(wrapText('Tell me about a time you failed', 12, measure)).toEqual(['Tell me', 'about a time', 'you failed'])
    expect(wrapText('Supercalifragilistic word', 5, measure)).toEqual(['Supercalifragilistic', 'word'])
  })

  it('covers the box like object-fit: cover', () => {
    expect(coverFit({ width: 1280, height: 720 }, { width: 720, height: 720 })).toEqual({ x: -280, y: 0, width: 1280, height: 720 })
  })
})
