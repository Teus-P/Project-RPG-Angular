import {describeListFetcher} from '../../testing/list-fetcher-testing'
import {TalentService} from './talent.service'

describeListFetcher({
  serviceName: 'TalentService',
  service: TalentService,
  endpoint: 'talent',
  sample: [{name: 'ACUTE_SENSE'}, {name: 'AMBIDEXTROUS'}],
  expectedLength: 2,
  emptiesListOnNull: true,
  fetch: service => service.fetchTalents(),
  list: service => service.talentList,
  changed: service => service.talentListChanged
})
