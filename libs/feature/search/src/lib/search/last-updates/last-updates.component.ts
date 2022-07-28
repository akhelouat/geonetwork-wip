import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'
import { SearchFacade } from '../../state/search.facade'
import { MetadataRecord, ES_SOURCE_BRIEF } from '@geonetwork-ui/util/shared'

@Component({
  selector: 'gn-ui-last-updates',
  templateUrl: './last-updates.component.html',
  styleUrls: ['./last-updates.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastUpdatesComponent implements OnInit {
  constructor(private searchfacade: SearchFacade) { }
  updates$: Observable<MetadataRecord[]>
  @Input() minPagination: number = 0
  @Input() maxPagination: number = 10

  ngOnInit(): void {
    this.searchfacade.setPagination(this.minPagination, this.maxPagination);
    this.searchfacade.setSortBy("-createDate");
    this.searchfacade.setConfigRequestFields({
      includes: [
        ...ES_SOURCE_BRIEF,
        'createDate', 'changeDate']
    });
    this.updates$ = this.searchfacade.results$.pipe(
      tap(console.log)
    )
  }
}