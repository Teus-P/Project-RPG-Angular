import {describeListFetcher} from '../../testing/list-fetcher-testing'
import {SkillService} from './skill.service'

describeListFetcher({
  serviceName: 'SkillService',
  service: SkillService,
  endpoint: 'skill',
  sample: [{name: 'ATHLETICS'}, {name: 'BRIBERY'}],
  expectedLength: 2,
  emptiesListOnNull: true,
  fetch: service => service.fetchSkills(),
  list: service => service.skillList,
  changed: service => service.skillListChanged
})
