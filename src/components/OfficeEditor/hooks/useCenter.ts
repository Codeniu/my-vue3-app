import { getObjectsBoundingBox } from '@/utils/fabric'
import useCanvas from './useCanvas'
import { Point } from 'fabric'
import type { CanvasElement } from '@/types/canvas'

export const WorkSpaceDrawType = 'WorkSpaceDrawType'
export const WorkSpaceClipType = 'WorkSpaceClipType'
export const WorkSpaceSafeType = 'WorkSpaceSafeType'
export const WorkSpaceMaskType = 'WorkSpaceMaskType'
export const WorkSpaceLineType = 'WorkSpaceLineType'

export const WorkSpaceThumbType = [
  WorkSpaceClipType,
  WorkSpaceSafeType,
  WorkSpaceMaskType,
  WorkSpaceLineType,
]

export const WorkSpaceCommonType = [
  WorkSpaceDrawType,
  WorkSpaceClipType,
  WorkSpaceSafeType,
  WorkSpaceMaskType,
  WorkSpaceLineType,
]

export default () => {
  const [canvas] = useCanvas()
  const workSpaceDraw = canvas
    .getObjects()
    .filter((item: any) => (item as CanvasElement).id === 'WorkSpaceDrawType')[0] as CanvasElement
  const objects = canvas.getObjects().filter((ele: any) => !WorkSpaceThumbType.includes(ele.id))
  const boundingBox = getObjectsBoundingBox(objects)

  let left = 0,
    top = 0
  let centerPoint = canvas.getCenterPoint()
  let width = canvas.getWidth(),
    height = canvas.getHeight()
  if (boundingBox) {
    centerPoint = new Point(boundingBox.centerX, boundingBox.centerY)
    width = boundingBox.width
    height = boundingBox.height
    left = boundingBox.centerX - boundingBox.width / 2
    top = boundingBox.centerY - boundingBox.height / 2
  }
  if (workSpaceDraw) {
    centerPoint = new Point(
      workSpaceDraw.left + workSpaceDraw.width / 2,
      workSpaceDraw.top + workSpaceDraw.height / 2,
    )
    width = workSpaceDraw.width
    height = workSpaceDraw.height
    left = workSpaceDraw.left
    top = workSpaceDraw.top
  }

  return {
    // workSpaceDraw,
    width,
    height,
    left,
    top,
    centerPoint,
  }
}
