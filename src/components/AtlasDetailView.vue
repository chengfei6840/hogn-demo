<script setup lang="ts">
import {ref,computed} from 'vue'
import {Button} from '@/components/ui/button'
import AppIcon from './AppIcon.vue'
import {atlasData} from '@/data/atlasData'
import StatusBadge from './StatusBadge.vue'
import {Input} from '@/components/ui/input'
import {useWorkspace} from '@/domain/store'

const props = defineProps<{
  atlasName: string
}>()

const emit = defineEmits<{
  close: []
}>()

const {toast} = useWorkspace()
const data = computed(() => atlasData[props.atlasName as keyof typeof atlasData])
const selectedString = ref<string | null>(null)
const editMode = ref(false)
const editData = ref<any>(null)
const searchQuery = ref('')

function selectString(stringId: string) {
  if (selectedString.value === stringId && !editMode.value) {
    selectedString.value = null
  } else {
    selectedString.value = stringId
    editMode.value = false
  }
}

function startEdit(stringId: string) {
  selectedString.value = stringId
  editMode.value = true
  const original = data.value?.strings.find(s => s.id === stringId)
  if (original) {
    editData.value = JSON.parse(JSON.stringify(original))
  }
}

function cancelEdit() {
  editMode.value = false
  editData.value = null
}

function saveEdit() {
  // 这里是演示，实际应该调用API保存
  toast('修改已保存（演示）')
  editMode.value = false
  editData.value = null
}

function deleteString(stringId: string, stringName: string) {
  if (confirm(`确定要删除串「${stringName}」吗？删除后将无法恢复。`)) {
    toast(`已删除串「${stringName}」（演示）`)
    // 实际应该调用API删除
  }
}

function addComponent() {
  if (editData.value) {
    editData.value.components.push({
      code: '',
      name: '',
      unit: '件',
      techId: ''
    })
  }
}

function removeComponent(index: number) {
  if (editData.value) {
    const comp = editData.value.components[index]
    if (confirm(`确定要删除子件「${comp.name || comp.code}」吗？`)) {
      editData.value.components.splice(index, 1)
    }
  }
}

const filteredStrings = computed(() => {
  if (!data.value?.strings) return []
  if (!searchQuery.value.trim()) return data.value.strings

  const query = searchQuery.value.toLowerCase()
  return data.value.strings.filter(str => {
    return str.name.toLowerCase().includes(query) ||
           str.id.toLowerCase().includes(query) ||
           str.voltage.toLowerCase().includes(query) ||
           str.conductor.toLowerCase().includes(query) ||
           str.imageRef.toLowerCase().includes(query)
  })
})

const selectedStringData = computed(() => {
  if (!selectedString.value) return null
  if (editMode.value) return editData.value
  return data.value?.strings.find(s => s.id === selectedString.value)
})
</script>

<template>
<div class="atlas-detail-overlay" @click.self="emit('close')">
  <div class="atlas-detail-container">
    <!-- 主内容区 -->
    <div class="atlas-detail-main">
      <div class="atlas-detail-header">
        <div>
          <h2>{{data?.info.name}}</h2>
          <p class="muted">查看拆解结果与结构化数据</p>
        </div>
        <Button variant="ghost" size="sm" @click="emit('close')">
          <AppIcon name="x" :size="20"/>
        </Button>
      </div>

      <div class="atlas-detail-content">
        <!-- 图册基本信息 -->
        <section class="atlas-info-section">
          <h3>图册信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">版本号</span>
              <span class="info-value mono">{{data?.info.version}}</span>
            </div>
            <div class="info-item">
              <span class="info-label">类型</span>
              <span class="info-value">{{data?.info.type}}</span>
            </div>
            <div class="info-item">
              <span class="info-label">上传日期</span>
              <span class="info-value">{{data?.info.uploadDate}}</span>
            </div>
            <div class="info-item">
              <span class="info-label">数据来源</span>
              <span class="info-value">{{data?.info.source}}</span>
            </div>
            <div class="info-item" v-if="data?.info.册号">
              <span class="info-label">册号</span>
              <span class="info-value">{{data?.info.册号}}</span>
            </div>
            <div class="info-item">
              <span class="info-label">串型数量</span>
              <span class="info-value">{{data?.info.totalStrings}} 个</span>
            </div>
            <div class="info-item">
              <span class="info-label">子件数量</span>
              <span class="info-value">{{data?.info.totalComponents}} 个</span>
            </div>
          </div>
        </section>

        <!-- 串型列表 -->
        <section class="strings-section">
          <div class="section-header">
            <div>
              <h3>客户货物项 <small style="color: var(--muted); font-weight: normal;">{{filteredStrings.length}} / {{data?.info.totalStrings}} 个</small></h3>
              <small class="muted">金具串与子串分别在行内展示；依据校对来源选择拆分列或合并行，以便核销；图册与子件构成分别保留</small>
            </div>
            <div style="width: 280px;">
              <Input v-model="searchQuery" placeholder="搜索串型号、导线、电压等级..." size="sm">
                <template #prefix>
                  <AppIcon name="magnifying-glass" :size="16" style="color: var(--muted);"/>
                </template>
              </Input>
            </div>
          </div>

          <div class="strings-table-wrap">
            <table class="strings-table">
              <thead>
                <tr>
                  <th style="width: 60px;">序号</th>
                  <th>线路名称 / 串型号</th>
                  <th style="width: 80px;">单位</th>
                  <th style="width: 200px;">适用导线</th>
                  <th style="width: 160px;">技术来源</th>
                  <th style="width: 110px;">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(str, idx) in filteredStrings"
                  :key="str.id"
                  class="string-row"
                  :class="{active: selectedString === str.id}"
                  @click="selectString(str.id)"
                >
                  <td class="text-center">{{String(idx + 1).padStart(2, '0')}}</td>
                  <td>
                    <div style="font-weight: 500;">{{str.name}}</div>
                    <div style="font-size: 13px; color: var(--muted); margin-top: 2px;" class="mono">{{str.id}}</div>
                  </td>
                  <td class="text-center">{{str.unit}}</td>
                  <td>{{str.conductor}}</td>
                  <td>
                    <StatusBadge text="待核对重复与子件"/>
                    <div style="font-size: 13px; color: var(--muted); margin-top: 4px;">{{str.imageRef}}<span v-if="str.page"> · {{str.page}}</span></div>
                  </td>
                  <td class="text-center">
                    <div style="display: flex; gap: 4px; justify-content: center;">
                      <Button size="sm" variant="ghost" @click.stop="startEdit(str.id)">修改</Button>
                      <Button size="sm" variant="ghost" @click.stop="deleteString(str.id, str.name)">删除</Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>

    <!-- 右侧子件抽屉 -->
    <div class="components-drawer" :class="{open: selectedString}">
      <div v-if="selectedStringData" class="drawer-content">
        <div class="drawer-header">
          <div>
            <h3>{{selectedStringData.name}}</h3>
            <p class="muted">{{editMode ? '编辑模式' : '子件清单'}} · {{selectedStringData.components.length}} 个</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <Button v-if="editMode" size="sm" @click="saveEdit">保存</Button>
            <Button v-if="editMode" size="sm" variant="outline" @click="cancelEdit">取消</Button>
            <Button variant="ghost" size="sm" @click="selectedString=null; editMode=false">
              <AppIcon name="x" :size="18"/>
            </Button>
          </div>
        </div>

        <div class="drawer-body">
          <!-- 串参数信息 -->
          <div class="string-params">
            <div class="param-row">
              <span class="param-label">串型号</span>
              <Input v-if="editMode" v-model="editData.id" size="sm"/>
              <span v-else class="param-value mono">{{selectedStringData.id}}</span>
            </div>
            <div class="param-row">
              <span class="param-label">线路名称</span>
              <Input v-if="editMode" v-model="editData.name" size="sm"/>
              <span v-else class="param-value">{{selectedStringData.name}}</span>
            </div>
            <div class="param-row">
              <span class="param-label">单位</span>
              <Input v-if="editMode" v-model="editData.unit" size="sm"/>
              <span v-else class="param-value">{{selectedStringData.unit}}</span>
            </div>
            <div class="param-row">
              <span class="param-label">适用导线</span>
              <Input v-if="editMode" v-model="editData.conductor" size="sm"/>
              <span v-else class="param-value">{{selectedStringData.conductor}}</span>
            </div>
            <div class="param-row">
              <span class="param-label">图册来源</span>
              <Input v-if="editMode" v-model="editData.imageRef" size="sm"/>
              <span v-else class="param-value">{{selectedStringData.imageRef}}<span v-if="selectedStringData.page"> · {{selectedStringData.page}}</span></span>
            </div>
          </div>

          <!-- 子件表格 -->
          <div class="components-list">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4>子件清单</h4>
              <Button v-if="editMode" size="sm" variant="outline" @click="addComponent">
                <AppIcon name="plus" :size="16"/>
                添加子件
              </Button>
            </div>
            <table class="components-table">
              <thead>
                <tr>
                  <th style="width: 130px;">子件型号</th>
                  <th>名称</th>
                  <th style="width: 60px;">单位</th>
                  <th style="width: 150px;">U9料号</th>
                  <th v-if="editMode" style="width: 50px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(comp, idx) in selectedStringData.components" :key="idx">
                  <td>
                    <Input v-if="editMode" v-model="comp.code" size="sm"/>
                    <span v-else class="mono">{{comp.code}}</span>
                  </td>
                  <td>
                    <Input v-if="editMode" v-model="comp.name" size="sm"/>
                    <span v-else>{{comp.name}}</span>
                  </td>
                  <td class="text-center">
                    <Input v-if="editMode" v-model="comp.unit" size="sm"/>
                    <span v-else>{{comp.unit}}</span>
                  </td>
                  <td>
                    <Input v-if="editMode" v-model="comp.techId" size="sm" placeholder="待补充"/>
                    <span v-else-if="comp.techId" class="mono">{{comp.techId}}</span>
                    <span v-else class="muted">待补充</span>
                  </td>
                  <td v-if="editMode">
                    <Button size="sm" variant="ghost" @click="removeComponent(idx)" style="padding: 4px;">
                      <AppIcon name="x-circle" :size="16" style="color: var(--destructive);"/>
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.atlas-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.atlas-detail-container {
  background: var(--background);
  border-radius: 12px;
  width: 100%;
  max-width: 1600px;
  height: 90vh;
  display: flex;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.atlas-detail-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.atlas-detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.atlas-detail-header h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
}

.atlas-detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.atlas-info-section {
  margin-bottom: 32px;
}

.atlas-info-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 13px;
  color: var(--muted);
}

.info-value {
  font-weight: 500;
}

.strings-section {

}

.section-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.section-header > div:first-child {
  flex: 1;
}

.section-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.strings-table-wrap {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.strings-table {
  width: 100%;
  border-collapse: collapse;
}

.strings-table thead {
  background: var(--surface);
}

.strings-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  color: var(--muted);
  font-weight: 500;
  border-bottom: 1px solid var(--border);
}

.strings-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.string-row {
  cursor: pointer;
  transition: background 0.15s;
}

.string-row:hover {
  background: var(--surface-hover);
}

.string-row.active {
  background: var(--surface-hover);
  border-left: 3px solid var(--primary);
}

.string-row:last-child td {
  border-bottom: none;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

/* 右侧抽屉 */
.components-drawer {
  width: 0;
  background: var(--surface);
  border-left: 1px solid var(--border);
  overflow: hidden;
  transition: width 0.3s ease;
}

.components-drawer.open {
  width: 600px;
}

.drawer-content {
  width: 600px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding: 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.drawer-header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.string-params {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.param-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.param-row:last-child {
  border-bottom: none;
}

.param-label {
  width: 100px;
  color: var(--muted);
  font-size: 14px;
}

.param-value {
  flex: 1;
  font-weight: 500;
}

.components-list h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
}

.components-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.components-table thead {
  background: var(--background);
}

.components-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 13px;
  color: var(--muted);
  font-weight: 500;
  border-bottom: 1px solid var(--border);
}

.components-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}

.components-table tbody tr:last-child td {
  border-bottom: none;
}

.components-table tbody tr:hover {
  background: var(--surface-hover);
}
</style>
