import {
  TABLE_ITEM_FIXTURE,
  TABLE_ITEM_FIXTURE_HAB,
  UiLayoutModule,
} from '@geonetwork-ui/ui/layout'
import {
  moduleMetadata,
  Story,
  Meta,
  componentWrapperDecorator,
} from '@storybook/angular'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FigureContainerComponent } from './figure-container.component'

export default {
  title: 'Dataviz/FigureContainerComponent',
  component: FigureContainerComponent,
  decorators: [
    moduleMetadata({
      imports: [UiLayoutModule, BrowserAnimationsModule],
    }),
    componentWrapperDecorator(
      (story) => `
<div class="border border-gray-300 p-2" style="width: 300px; resize: both; overflow: auto">
  ${story}
</div>`
    ),
  ],
} as Meta<FigureContainerComponent>

const Template: Story<FigureContainerComponent> = (
  args: FigureContainerComponent
) => ({
  component: FigureContainerComponent,
  props: args,
})

export const Sum = Template.bind({})
Sum.args = {
  title: 'Sum of inhabitants',
  icon: 'maps_home_work',
  unit: 'hab.',
  expression: 'sum|pop',
  dataset: TABLE_ITEM_FIXTURE_HAB,
}

export const Average = Template.bind({})
Average.args = {
  title: 'Average age of the population',
  icon: 'group',
  unit: 'years old',
  expression: 'average|age',
  digits: 3,
  dataset: TABLE_ITEM_FIXTURE,
}
