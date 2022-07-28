import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

@Component({
  selector: 'gn-ui-updates-list',
  templateUrl: './updates-list.component.html',
  styleUrls: ['./updates-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatesListComponent {
  @Input() updates = []
}
