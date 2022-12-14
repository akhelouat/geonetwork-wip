import { Injectable } from '@angular/core'
import { getThemeConfig, isConfigLoaded } from '@geonetwork-ui/util/app-config'
import chroma from 'chroma-js'
import { Fill, Stroke, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import { StyleLike } from 'ol/style/Style'

export interface CreateStyleOptions {
  color?: string
  radius?: number
  width?: number
}

type DefaultStyleKeys = 'default' | 'defaultHL' | string

@Injectable({
  providedIn: 'root',
})
export class MapStyleService {
  styles: Record<DefaultStyleKeys, StyleLike> = {
    default: this.createStyle(),
    defaultHL: this.createDefaultStyleHL(),
  }

  createStyle(options: CreateStyleOptions = {}): Style {
    const defaultColor = isConfigLoaded()
      ? getThemeConfig().PRIMARY_COLOR
      : 'blue'
    const { color = defaultColor, width = 2, radius = 7 } = options
    const fill = new Fill({
      color,
    })
    const stroke = new Stroke({
      color: 'white',
      width,
    })
    return new Style({
      image: new CircleStyle({
        fill,
        stroke,
        radius,
      }),
      fill: new Fill({
        color: this.computeTransparentFillColor(color),
      }),
      stroke,
    })
  }

  private createDefaultStyleHL() {
    const style = this.createStyle()
    const defaultColorHL = isConfigLoaded()
      ? getThemeConfig().SECONDARY_COLOR
      : 'red'
    return this.createHLFromStyle(style, defaultColorHL)
  }

  createHLFromStyle(style: Style, color): Style {
    const circle = style.getImage() as CircleStyle
    style.getFill().setColor(this.computeTransparentFillColor(color))
    circle.getFill().setColor(color)
    circle.getStroke().setWidth(circle.getStroke().getWidth() + 1)
    circle.setRadius(circle.getRadius() + 1)
    style.setZIndex(10)
    return style
  }

  private computeTransparentFillColor(color: string, alpha = 0.25): string {
    return chroma(color).alpha(alpha).css()
  }
}
