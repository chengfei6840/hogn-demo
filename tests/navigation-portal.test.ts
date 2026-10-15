import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const appSource = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
const collaborationSource = readFileSync(new URL('../src/components/CollaborationView.vue', import.meta.url), 'utf8')
const sidebarProgressSource = readFileSync(new URL('../src/components/workflow/SidebarProgress.vue', import.meta.url), 'utf8')
const projectProgressSource = readFileSync(new URL('../src/components/workflow/ProjectProgress.vue', import.meta.url), 'utf8')
const partsSource = readFileSync(new URL('../src/components/PartsPanel.vue', import.meta.url), 'utf8')
const inquirySource = readFileSync(new URL('../src/components/NewInquiryDialog.vue', import.meta.url), 'utf8')

test('协作弹窗使用独立且稳定的 portal 宿主，切换页面时不会与 main 子树互相卸载', () => {
  const portalRootIndex = appSource.indexOf('id="workflow-dialog-root"')
  const collaborationViewIndex = appSource.indexOf('<CollaborationView')

  assert.ok(portalRootIndex >= 0)
  assert.ok(portalRootIndex < collaborationViewIndex)
  assert.doesNotMatch(collaborationSource, /portal-to="#main-content"/)
  assert.doesNotMatch(partsSource, /portal-to="#main-content"/)
  assert.match(collaborationSource, /portal-to="#workflow-dialog-root"/)
  assert.match(partsSource, /portal-to="#workflow-dialog-root"/)
})

test('新建报价包的本包流程负责人包含可选的技术确认人员', () => {
  assert.match(inquirySource, /key:'technicalConfirmation'[^\n]*label:'技术总监确认'[^\n]*role:'技术'/)
  assert.match(inquirySource, /选择 '\+card\.label\+' 负责人'/)
  assert.match(inquirySource, /processParticipants: \{ dataParsing: person\.value, salesConfirmation: person\.value, \.\.\.processParticipants\.value \}/)
})

test('非本包技术确认人进入技术阶段时停留在当前页并展示访问拒绝状态', () => {
  assert.doesNotMatch(appSource, /page\.value='overview'/)
  assert.match(collaborationSource, /technicalAccessDenied/)
  assert.match(collaborationSource, /你无权访问该页面/)
  assert.match(collaborationSource, /本包“\{\{ accessDeniedStage \}\}”已指定由/)
  assert.doesNotMatch(sidebarProgressSource, /technicalOwnerAllowed/)
  assert.doesNotMatch(projectProgressSource, /technicalOwnerAllowed/)
})
