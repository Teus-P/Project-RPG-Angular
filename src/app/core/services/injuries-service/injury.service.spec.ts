import {describeListFetcher} from '../../testing/list-fetcher-testing'
import {InjuryService} from './injury.service'

describeListFetcher({
  serviceName: 'InjuryService',
  service: InjuryService,
  endpoint: 'injury',
  sample: [{name: 'BRUISED'}, {name: 'TORN'}],
  expectedLength: 2,
  emptiesListOnNull: true,
  fetch: service => service.fetchInjuries(),
  list: service => service.injuriesList,
  changed: service => service.injuriesChanged
})
