import { MetadataRecord } from '@geonetwork-ui/util/shared'
import { createAction, props } from '@ngrx/store'

export const loadFullMetadata = createAction(
  '[Metadata view] Load full metadata',
  props<{ uuid: string }>()
)

export const setIncompleteMetadata = createAction(
  '[Metadata view] Set incomplete metadata',
  props<{ incomplete: MetadataRecord }>()
)

export const loadFullSuccess = createAction(
  '[Metadata view] Load full success',
  props<{ full: MetadataRecord }>()
)

export const loadFullFailure = createAction(
  '[Metadata view] Load full failure',
  props<{ error: string }>()
)

export const setRelated = createAction(
  '[Metadata view] Set related records',
  props<{ related: MetadataRecord[] }>()
)

export const close = createAction('[Metadata view] close')
