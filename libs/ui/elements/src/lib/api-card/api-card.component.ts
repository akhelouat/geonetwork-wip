import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core'
import { MetadataLinkValid } from '@geonetwork-ui/util/shared'

@Component({
  selector: 'gn-ui-api-card',
  templateUrl: './api-card.component.html',
  styleUrls: ['./api-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiCardComponent {
  @Input() link: MetadataLinkValid
  @Output() apiUrl = new EventEmitter<string>()

  copyUrl() {
    navigator.clipboard.writeText(this.link.url)
    this.apiUrl.emit(this.link.url)
  }
}
