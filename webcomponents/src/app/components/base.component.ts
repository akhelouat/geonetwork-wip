import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { ColorService } from '@lib/common'
import { Configuration } from '@lib/gn-api'
import { SearchFacade } from '@lib/search'

export const apiConfiguration = new Configuration()

@Component({
  selector: 'wc-base',
  template: `<div></div>`,
})
export class BaseComponent implements OnInit, OnChanges {
  @Input() apiUrl = '/'
  @Input() searchId: string
  @Input() primaryColor = '#9a9a9a'
  @Input() secondaryColor = '#767676'
  @Input() mainColor = '#1a1a1a'
  @Input() backgroundColor = '#cecece'

  isInitialized = false

  constructor(protected facade: SearchFacade) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isInitialized) {
      apiConfiguration.basePath = this.apiUrl
      ColorService.applyCssVariables(
        this.primaryColor,
        this.secondaryColor,
        this.mainColor,
        this.backgroundColor
      )
      this.isInitialized = true
      this.facade.init(this.searchId)
    }
  }
}