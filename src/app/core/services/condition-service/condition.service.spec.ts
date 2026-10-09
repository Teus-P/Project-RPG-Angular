import {describeListFetcher} from '../../testing/list-fetcher-testing'
import {ConditionService} from './condition.service'

describeListFetcher({
  serviceName: 'ConditionService',
  service: ConditionService,
  endpoint: 'condition',
  sample: [{name: 'ABLAZE'}, {name: 'BLEEDING'}],
  expectedLength: 2,
  emptiesListOnNull: true,
  fetch: service => service.fetchConditions(),
  list: service => service.conditionsList,
  changed: service => service.conditionsChanged
})
