<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Setting } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type SmsConfigRow = {
  id: number
  group: string
  createdAt: string
  updatedAt: string
  storeType: string
  storeName: string
  productName: string
  productId: string
  qrCode: string
  purchaseReminder: string
  authorizationReminder: string
  manualReminder: string
  status: '启用' | '停用'
}

const rows = ref<SmsConfigRow[]>([
  { id: 1, group: '默认分组', createdAt: '2026-05-18 15:33:15', updatedAt: '2026-08-24 23:28:19', storeType: '抖店', storeName: '熹瑶学堂', productName: '阿留教育规划精华家长课【全平台首创】读书卡', productId: '372412015418395886', qrCode: '0830 8.25', purchaseReminder: '用户下单', authorizationReminder: '用户授权', manualReminder: '用户提醒', status: '启用' },
  { id: 2, group: '阿留皮皮', createdAt: '2026-06-13 17:39:06', updatedAt: '2026-08-24 23:28:19', storeType: '抖店', storeName: '熹瑶教育规划', productName: '阿留教育规划精华家长课-读书卡', productId: '3735011933473079446', qrCode: '0830 8.25', purchaseReminder: '下单1', authorizationReminder: '下单2', manualReminder: '下单3', status: '启用' },
  { id: 3, group: '阿留皮皮', createdAt: '2026-07-24 12:13:56', updatedAt: '2026-08-24 23:28:19', storeType: '抖店', storeName: '合数智胜', productName: '【状元阿留】教育精华家长课-读书卡', productId: '3832962989930185133', qrCode: '0830 8.25', purchaseReminder: '下单1', authorizationReminder: '下单2', manualReminder: '下单3', status: '启用' },
  { id: 4, group: '周老师', createdAt: '2026-06-24 08:28:09', updatedAt: '2026-08-24 23:28:09', storeType: '百家号', storeName: '阿留状元教育规划', productName: '家庭教育直播体验课', productId: '71967409586', qrCode: '0830 周老师', purchaseReminder: '支付成功后5分钟', authorizationReminder: '用户授权', manualReminder: '运营手动触发', status: '停用' }
])

const groups = ref(['全部', '默认分组', '阿留皮皮', '周老师', '北京店播'])
const activeGroup = ref('全部')
const selectedRows = ref<SmsConfigRow[]>([])
const dialogVisible = ref(false)
const batchMode = ref(false)
const editingId = ref<number | null>(null)
const query = reactive({ keyword: '', storeType: '', status: '' })
const form = reactive({ group: '默认分组', productId: '', qrCode: '', purchaseReminder: '用户下单', authorizationReminder: '用户授权', manualReminder: '用户提醒', status: '启用' as '启用' | '停用' })

const products = computed(() => [...new Map(rows.value.map(row => [row.productId, { id: row.productId, name: row.productName, store: row.storeName, storeType: row.storeType }])).values()])
const qrOptions = ['0830 8.25', '0830 周老师', '0906 秋季营', '不关联活码']
const storeTypes = computed(() => [...new Set(rows.value.map(row => row.storeType))])
const filteredRows = computed(() => {
  const term = query.keyword.trim().toLowerCase()
  return rows.value.filter(row => (activeGroup.value === '全部' || row.group === activeGroup.value)
    && (!term || `${row.productName}${row.productId}${row.storeName}${row.qrCode}`.toLowerCase().includes(term))
    && (!query.storeType || row.storeType === query.storeType)
    && (!query.status || row.status === query.status))
})
const selectedProduct = computed(() => products.value.find(item => item.id === form.productId))

function resetQuery() { Object.assign(query, { keyword: '', storeType: '', status: '' }) }
function resetForm() { Object.assign(form, { group: '默认分组', productId: '', qrCode: '', purchaseReminder: '用户下单', authorizationReminder: '用户授权', manualReminder: '用户提醒', status: '启用' }) }
function openCreate() { batchMode.value = false; editingId.value = null; resetForm(); dialogVisible.value = true }
function openEdit(row: SmsConfigRow) {
  batchMode.value = false
  editingId.value = row.id
  Object.assign(form, row)
  dialogVisible.value = true
}
function openBatch() {
  if (!selectedRows.value.length) return ElMessage.warning('请先勾选需要批量设置的商品')
  batchMode.value = true
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}
function save() {
  if (!batchMode.value && (!form.productId || !form.qrCode)) return ElMessage.warning('请选择商品和活码')
  const now = '2026-08-25 16:30:00'
  if (batchMode.value) {
    selectedRows.value.forEach(row => Object.assign(row, { purchaseReminder: form.purchaseReminder, authorizationReminder: form.authorizationReminder, manualReminder: form.manualReminder, status: form.status, updatedAt: now }))
    ElMessage.success(`已更新 ${selectedRows.value.length} 条短信配置`)
  } else if (editingId.value) {
    const row = rows.value.find(item => item.id === editingId.value)
    if (row) Object.assign(row, form, selectedProduct.value ? { productName: selectedProduct.value.name, storeName: selectedProduct.value.store, storeType: selectedProduct.value.storeType } : {}, { updatedAt: now })
    ElMessage.success('短信配置已更新')
  } else if (selectedProduct.value) {
    rows.value.unshift({ id: Date.now(), createdAt: now, updatedAt: now, productName: selectedProduct.value.name, storeName: selectedProduct.value.store, storeType: selectedProduct.value.storeType, ...form })
    ElMessage.success('短信配置已创建')
  }
  dialogVisible.value = false
}
async function remove(row: SmsConfigRow) {
  await ElMessageBox.confirm(`确认删除“${row.productName}”的短信配置？`, '删除确认', { type: 'warning' })
  rows.value = rows.value.filter(item => item.id !== row.id)
  ElMessage.success('短信配置已删除')
}
async function addGroup() {
  const result = await ElMessageBox.prompt('请输入短信分组名称', '新增分组', { inputPlaceholder: '例如：秋季营', inputValidator: value => Boolean(value.trim()) || '请输入分组名称' })
  const name = result.value.trim()
  if (!groups.value.includes(name)) groups.value.push(name)
  activeGroup.value = name
  ElMessage.success('短信分组已创建')
}
</script>

<template>
  <section class="page sms-config-page">
    <PageHeader eyebrow="PRODUCT MESSAGE POLICY" title="短信配置" description="为第三方商品绑定活码和提醒策略；签名、模板与发送回执仍由业务配置—短信管理统一维护。">
      <el-button :icon="Setting" :disabled="!selectedRows.length" @click="openBatch">批量设置</el-button>
      <el-button type="primary" :icon="Plus" @click="openCreate">新增配置</el-button>
    </PageHeader>

    <div class="sms-layout">
      <aside class="group-panel surface">
        <header><div><b>短信分组</b><small>按IP、团队或营期整理</small></div><button type="button" @click="addGroup">＋添加</button></header>
        <nav><button v-for="group in groups" :key="group" type="button" :class="{ active: activeGroup === group }" @click="activeGroup = group"><span>{{ group }}</span><em>{{ group === '全部' ? rows.length : rows.filter(row => row.group === group).length }}</em></button></nav>
      </aside>

      <main>
        <div class="sms-filter surface">
          <el-input v-model="query.keyword" clearable :prefix-icon="Search" placeholder="商品ID、商品名称、店铺或活码" />
          <el-select v-model="query.storeType" clearable placeholder="店铺类型"><el-option v-for="item in storeTypes" :key="item" :label="item" :value="item" /></el-select>
          <el-select v-model="query.status" clearable placeholder="配置状态"><el-option label="启用" value="启用"/><el-option label="停用" value="停用"/></el-select>
          <el-button type="primary">查询</el-button><el-button @click="resetQuery">重置</el-button>
        </div>

        <article class="sms-ledger surface">
          <header><div><h3>商品短信策略</h3><span>共 {{ filteredRows.length }} 条</span></div><p>同一商品可按不同活码配置不同提醒策略</p></header>
          <el-table :data="filteredRows" row-key="id" @selection-change="selectedRows = $event">
            <el-table-column type="selection" width="48"/>
            <el-table-column label="创建/更新时间" width="150"><template #default="{row}"><div class="date-stack"><span>{{ row.createdAt }}</span><small>{{ row.updatedAt }}</small></div></template></el-table-column>
            <el-table-column label="店铺" width="150"><template #default="{row}"><div class="store-cell"><el-tag type="success" effect="light">{{ row.storeType }}</el-tag><span>{{ row.storeName }}</span></div></template></el-table-column>
            <el-table-column label="商品名称" min-width="230"><template #default="{row}"><b class="product-title">{{ row.productName }}</b></template></el-table-column>
            <el-table-column label="商品ID" min-width="160"><template #default="{row}"><code>{{ row.productId }}</code></template></el-table-column>
            <el-table-column prop="qrCode" label="活码名称" width="125"/>
            <el-table-column prop="purchaseReminder" label="购买后提醒" width="135"/>
            <el-table-column prop="authorizationReminder" label="授权后提醒" width="135"/>
            <el-table-column prop="manualReminder" label="手动提醒" width="135"/>
            <el-table-column label="状态" width="85"><template #default="{row}"><el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag></template></el-table-column>
            <el-table-column label="操作" width="135" fixed="right"><template #default="{row}"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
          </el-table>
        </article>
      </main>
    </div>

    <el-dialog v-model="dialogVisible" :title="batchMode ? `批量设置（${selectedRows.length}条）` : editingId ? '编辑短信配置' : '新增短信配置'" width="680px">
      <el-alert v-if="batchMode" title="仅更新提醒策略和状态，商品、活码及分组保持不变。" type="info" :closable="false"/>
      <el-form label-position="top" class="sms-form">
        <template v-if="!batchMode">
          <el-form-item label="分组" required><el-select v-model="form.group" filterable style="width:100%"><el-option v-for="group in groups.filter(item => item !== '全部')" :key="group" :label="group" :value="group"/></el-select></el-form-item>
          <el-form-item label="商品名称" required><el-select v-model="form.productId" filterable placeholder="请选择商品" style="width:100%"><el-option v-for="item in products" :key="item.id" :label="`${item.name} · ${item.store}`" :value="item.id"/></el-select></el-form-item>
          <el-form-item label="活码" required><el-select v-model="form.qrCode" filterable placeholder="请选择活码" style="width:100%"><el-option v-for="item in qrOptions" :key="item" :label="item" :value="item"/></el-select></el-form-item>
        </template>
        <div class="form-grid">
          <el-form-item label="购买后提醒" required><el-select v-model="form.purchaseReminder" style="width:100%"><el-option v-for="item in ['不提醒','用户下单','支付成功后5分钟','支付成功后1小时']" :key="item" :label="item" :value="item"/></el-select></el-form-item>
          <el-form-item label="授权后提醒" required><el-select v-model="form.authorizationReminder" style="width:100%"><el-option v-for="item in ['不提醒','用户授权','授权成功后10分钟']" :key="item" :label="item" :value="item"/></el-select></el-form-item>
          <el-form-item label="手动提醒" required><el-select v-model="form.manualReminder" style="width:100%"><el-option v-for="item in ['不提醒','用户提醒','运营手动触发']" :key="item" :label="item" :value="item"/></el-select></el-form-item>
          <el-form-item label="状态" required><el-radio-group v-model="form.status"><el-radio-button value="启用">启用</el-radio-button><el-radio-button value="停用">停用</el-radio-button></el-radio-group></el-form-item>
        </div>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="save">保存配置</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>
.sms-config-page{--ink:#172943;--muted:#8190a5}.sms-layout{display:grid;grid-template-columns:230px minmax(0,1fr);gap:14px}.group-panel{min-height:610px;padding:18px 12px}.group-panel header{display:flex;align-items:flex-start;justify-content:space-between;padding:0 8px 15px;border-bottom:1px solid #edf1f6}.group-panel header div{display:grid;gap:4px}.group-panel header b{color:var(--ink);font-size:15px}.group-panel header small{color:var(--muted);font-size:10px}.group-panel header button{border:0;background:none;color:#2875e6;font-weight:700;cursor:pointer}.group-panel nav{display:grid;gap:5px;padding-top:12px}.group-panel nav button{display:flex;align-items:center;justify-content:space-between;padding:12px 13px;border:0;border-radius:9px;background:transparent;color:#5c6d84;text-align:left;cursor:pointer}.group-panel nav button:hover{background:#f5f8fc}.group-panel nav button.active{background:#eaf2ff;color:#2170df;font-weight:800}.group-panel nav em{font-style:normal;font-size:10px}.sms-layout main{min-width:0}.sms-filter{display:grid;grid-template-columns:minmax(260px,1.4fr) .65fr .6fr auto auto;gap:9px;padding:14px 16px;margin-bottom:14px}.sms-ledger{padding:0 18px 18px;overflow:hidden}.sms-ledger>header{height:62px;display:flex;align-items:center;justify-content:space-between}.sms-ledger header>div{display:flex;align-items:baseline;gap:10px}.sms-ledger h3{margin:0;color:var(--ink)}.sms-ledger header span,.sms-ledger header p{color:var(--muted);font-size:10px}.date-stack,.store-cell{display:grid;gap:5px}.date-stack small{color:#95a1b1}.store-cell .el-tag{width:max-content}.store-cell span{color:#5d6d83;font-size:11px}.product-title{color:var(--ink);line-height:1.6}.sms-ledger code{padding:4px 7px;border:1px solid #dae5f2;border-radius:6px;background:#f2f6fb;color:#426790;font:700 10px ui-monospace,SFMono-Regular,Menlo,monospace}.sms-form{padding-top:14px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}@media(max-width:1100px){.sms-layout{grid-template-columns:1fr}.group-panel{min-height:auto}.group-panel nav{grid-template-columns:repeat(3,1fr)}.sms-filter{grid-template-columns:repeat(2,1fr)}}
</style>
