import { CommonModule } from '@angular/common'
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http'
import { ApiModule } from '@geonetwork-ui/data-access/gn4'
import { UiSearchModule } from '@geonetwork-ui/ui/search'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { TranslateModule } from '@ngx-translate/core'
import { InfiniteScrollModule } from 'ngx-infinite-scroll'
import { FacetsModule } from './facets/facets.module'
import { FuzzySearchComponent } from './fuzzy-search/fuzzy-search.component'
import { RecordsMetricsComponent } from './records-metrics/records-metrics.component'
import { ResultsLayoutComponent } from './results-layout/results-layout.component'
import { ResultsListContainerComponent } from './results-list/results-list.container.component'
import { SortByComponent } from './sort-by/sort-by.component'
import { SearchEffects } from './state/effects'
import { initialState, reducer, SEARCH_FEATURE_KEY } from './state/reducer'
import { ResultsHitsContainerComponent } from './results-hits-number/results-hits.container.component'
import { SearchStateContainerDirective } from './state/container/search-state.container.directive'
import { UiInputsModule } from '@geonetwork-ui/ui/inputs'
import { NgModule } from '@angular/core'
import { UiElementsModule } from '@geonetwork-ui/ui/elements'
import { LastUpdatesComponent } from './search/last-updates/last-updates.component'

@NgModule({
  declarations: [
    SortByComponent,
    ResultsLayoutComponent,
    FuzzySearchComponent,
    RecordsMetricsComponent,
    ResultsListContainerComponent,
    ResultsHitsContainerComponent,
    SearchStateContainerDirective,
    LastUpdatesComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    StoreModule.forFeature(SEARCH_FEATURE_KEY, reducer, {
      initialState,
    }),
    EffectsModule.forFeature([SearchEffects]),
    HttpClientModule,
    HttpClientXsrfModule,
    UiSearchModule,
    UiInputsModule,
    UiElementsModule,
    ApiModule,
    FacetsModule,
    InfiniteScrollModule,
  ],
  exports: [
    SortByComponent,
    ResultsLayoutComponent,
    FuzzySearchComponent,
    RecordsMetricsComponent,
    ResultsListContainerComponent,
    ResultsHitsContainerComponent,
    FacetsModule,
    SearchStateContainerDirective,
    LastUpdatesComponent,
  ],
})
export class FeatureSearchModule { }
