<script setup lang="ts">
import {reactive,shallowRef} from 'vue'
import { useWorkspace } from '@/domain/store'
import {Button} from '@/components/ui/button'
import StatusBadge from './StatusBadge.vue'
import FormDialog from './FormDialog.vue'
import { Input } from '@/components/ui/input'
import AppIcon from './AppIcon.vue'
import AtlasDetailView from './AtlasDetailView.vue'

const {role,toast}=useWorkspace()
const uploadOpen=shallowRef(false)
const viewAtlas=shallowRef<string|null>(null)
const uploadForm=reactive({
  name:'',
  file:null as File|null
})

const sourceRecords=reactive([
  {atlasName:'国网南网主网配网线路子件U9料号汇总',name:'国网南网主网与配网线路子件U9料号匹配汇总20260805.xlsx',kind:'U9辅助映射',status:'待审核',version:'导入 V2026.08.05',detail:'客户手工录入；重复与更新时效需复核'},
  {atlasName:'国网图册 · 750kV输电线路金具',name:'国网图册收集 · 750kV 输电线路金具分册',kind:'图册结构化数据',status:'待审核',version:'抽取 V2026.09.15',detail:'保留分册、图号、串型号、适用条件、子件和来源位置'},
  {atlasName:'国网图册 · 220kV输电线路金具',name:'国网图册收集 · 220kV 输电线路金具分册',kind:'图册结构化数据',status:'已发布',version:'检索基线 V2026.09.01',detail:'已通过红光技术审核'}
])

function handleFileChange(e:Event){
  const target=e.target as HTMLInputElement
  if(target.files && target.files[0]){
    uploadForm.file=target.files[0]
    if(!uploadForm.name){
      uploadForm.name=target.files[0].name.replace(/\.[^/.]+$/,'')
    }
  }
}

function submitUpload(){
  if(!uploadForm.file){
    toast('请选择要上传的图册文件')
    return
  }
  if(!uploadForm.name.trim()){
    toast('请输入图册名称')
    return
  }

  // 模拟上传和拆解处理
  const newRecord={
    name:uploadForm.name,
    kind:'图册结构化数据',
    status:'待审核',
    version:`抽取 V2026.09.17`,
    detail:'新上传图册，等待结构化拆解与技术审核'
  }

  sourceRecords.unshift(newRecord)
  toast('图册已上传，开始结构化拆解处理（演示）')

  // 重置表单
  uploadForm.name=''
  uploadForm.file=null
  uploadOpen.value=false
}
</script>
<template>
<div class="page-heading">
  <div>
    <p class="eyebrow">基础数据与治理</p>
    <h1>资料治理</h1>
    <p class="muted">辅助来源先比对、再由红光人员审核发布；未发布版本不参与检索。</p>
  </div>
  <div style="display: flex; align-items: center; gap: 12px;">
    <Button @click="uploadOpen=true" :disabled="role!=='技术'">
      <AppIcon name="upload-simple" :size="16"/>
      上传新图册
    </Button>
    <StatusBadge text="按整批版本发布"/>
  </div>
</div>
<section class="panel">
  <div class="panel-heading">
    <h2>U9 与国网图册资料</h2>
    <span class="muted">展示资料版本管理</span>
  </div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>图册名称</th>
          <th>来源</th>
          <th>类型</th>
          <th>版本</th>
          <th>审核状态</th>
          <th>比对说明</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in sourceRecords" :key="r.name" style="cursor: pointer;" @click="viewAtlas=r.name">
          <td class="text-left">{{r.atlasName}}</td>
          <td class="text-left">{{r.name}}</td>
          <td>{{r.kind}}</td>
          <td class="mono">{{r.version}}</td>
          <td><StatusBadge :text="r.status"/></td>
          <td class="text-left">{{r.detail}}</td>
          <td @click.stop>
            <div style="display: flex; gap: 8px;">
              <Button size="sm" variant="outline" @click="viewAtlas=r.name">
                <AppIcon name="eye" :size="16"/>
                查看
              </Button>
              <Button v-if="r.status==='待审核'" size="sm" :disabled="role!=='技术'" @click="r.status='已发布';toast('红光技术审核通过，已发布新的检索基础版本')">审核并发布</Button>
              <span v-else class="muted">可供新检索使用</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="notice">图册结构化数据必须保留原 PDF、分册、页码或图号及来源位置；与人工录入不一致时并列保留并进入技术复核。</div>
</section>

<FormDialog v-model="uploadOpen" title="上传新图册进行拆解">
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <label>
      图册名称
      <Input v-model="uploadForm.name" placeholder="例如：国网图册收集 · 500kV 输电线路金具分册"/>
    </label>
    <label>
      选择图册文件
      <div style="margin-top: 8px;">
        <input
          type="file"
          accept=".pdf,.xlsx,.xls"
          @change="handleFileChange"
          id="atlas-file-input"
          style="display: none;"
        />
        <label
          for="atlas-file-input"
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 48px 24px;
            border: 2px dashed var(--border);
            border-radius: 8px;
            cursor: pointer;
            background: var(--surface);
            transition: all 0.2s;
          "
          onmouseover="this.style.borderColor='var(--primary)';this.style.background='var(--surface-hover)';"
          onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--surface)';"
        >
          <div style="
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--surface-hover);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--border);
          ">
            <AppIcon name="plus" :size="24" style="color: var(--primary);"/>
          </div>
          <div style="text-align: center;">
            <div style="font-weight: 500; color: var(--foreground); margin-bottom: 4px;">点击选择文件</div>
            <small style="color: var(--muted);">支持 PDF、Excel 格式</small>
          </div>
        </label>
      </div>
    </label>
    <div v-if="uploadForm.file" style="padding: 12px; background: var(--surface); border-radius: 8px; display: flex; align-items: center; gap: 12px; border: 1px solid var(--border);">
      <AppIcon name="file-pdf" :size="24" style="color: var(--primary);"/>
      <div style="flex: 1;">
        <div style="font-weight: 500;">{{uploadForm.file.name}}</div>
        <small style="color: var(--muted);">{{(uploadForm.file.size / 1024 / 1024).toFixed(2)}} MB</small>
      </div>
      <AppIcon name="check-circle" :size="20" style="color: var(--success);"/>
    </div>
    <div style="padding: 12px; background: var(--surface); border-radius: 8px;">
      <div style="font-weight: 500; margin-bottom: 8px;">拆解处理说明：</div>
      <ul style="margin: 0; padding-left: 20px; color: var(--muted); font-size: 14px; line-height: 1.6;">
        <li>系统将自动提取分册、图号、串型号信息</li>
        <li>保留子件清单及适用条件</li>
        <li>记录原始来源位置便于追溯</li>
        <li>拆解完成后进入待审核状态</li>
      </ul>
    </div>
    <Button @click="submitUpload" style="margin-top: 8px;">开始上传并拆解</Button>
  </div>
</FormDialog>

<AtlasDetailView v-if="viewAtlas" :atlas-name="viewAtlas" @close="viewAtlas=null"/>
</template>
