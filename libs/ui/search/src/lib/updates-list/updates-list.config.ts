import { InjectionToken, Type } from '@angular/core'
import { RecordPreviewCardComponent } from '../record-preview-card/record-preview-card.component'
import { RecordPreviewListComponent } from '../record-preview-list/record-preview-list.component'
import { RecordPreviewTextComponent } from '../record-preview-text/record-preview-text.component'
import { RecordPreviewTitleComponent } from '../record-preview-title/record-preview-title.component'
import { RecordPreviewComponent } from '../record-preview/record-preview.component'

const DEFAULT_ITEM_CLS = 'pb-4'
const DEFAULT_CONTAINER_CLS = 'gap-4 p-4'

export class LastCreatedConfigItem {
  constructor(
    public component: Type<RecordPreviewComponent>,
    public itemClass: string = DEFAULT_ITEM_CLS,
    public itemStyle: string = '',
    public containerClass: string = DEFAULT_CONTAINER_CLS
  ) { }
}
export type LastCreatedConfigModel = Record<string, LastCreatedConfigItem>

export const RESULTS_LAYOUT_CONFIG =
  new InjectionToken<LastCreatedConfigModel>('results-layout.config')

export const DEFAULT_RESULTS_LAYOUT_CONFIG: LastCreatedConfigModel = {
  CARD: new LastCreatedConfigItem(
    RecordPreviewCardComponent,
    '',
    'height: 24em;',
    'grid md:grid-cols-2 lg:grid-cols-4 gap-4 p-4'
  ),
  LIST: new LastCreatedConfigItem(RecordPreviewListComponent),
  TEXT: new LastCreatedConfigItem(RecordPreviewTextComponent),
  TITLE: new LastCreatedConfigItem(RecordPreviewTitleComponent),
}
