import {describeListFetcher} from '../../testing/list-fetcher-testing'
import {AvailabilityService} from './availability.service'

describeListFetcher({
  serviceName: 'AvailabilityService',
  service: AvailabilityService,
  endpoint: 'availability',
  sample: [{name: 'COMMON'}, {name: 'RARE'}],
  expectedLength: 2,
  emptiesListOnNull: false,
  fetch: service => service.fetchAvailabilities(),
  list: service => service.availabilityList,
  changed: service => service.availabilityListChanged
})
