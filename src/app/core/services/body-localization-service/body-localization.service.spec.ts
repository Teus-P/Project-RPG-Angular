import {describeListFetcher} from '../../testing/list-fetcher-testing'
import {BodyLocalizationService} from './body-localization.service'

describeListFetcher({
  serviceName: 'BodyLocalizationService',
  service: BodyLocalizationService,
  endpoint: 'bodyLocalization',
  sample: [{name: 'HEAD'}, {name: 'BODY'}],
  expectedLength: 2,
  emptiesListOnNull: true,
  fetch: service => service.fetchBodyLocalizations(),
  list: service => service.bodyLocalizationsList,
  changed: service => service.bodyLocalizationsChanged
})
