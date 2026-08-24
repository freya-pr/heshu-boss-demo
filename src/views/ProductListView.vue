<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download, Refresh, Search } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type ProductStatus = '在线' | '下线'

type ProductRow = {
  id: number
  createdAt: string
  updatedAt: string
  name: string
  qrAssigned: boolean
  productId: string
  status: ProductStatus
  storeName: string
  storeType: string
  ipNo: string
  ipName: string
  remark: string
}

const route = useRoute()
const loading = ref(false)
const remarkVisible = ref(false)
const activeProduct = ref<ProductRow | null>(null)
const remark = ref('')
const page = ref(1)
const pageSize = ref(10)

const rows = ref<ProductRow[]>([
  { id: 1, createdAt: '2026-08-20 21:48:45', updatedAt: '2026-08-20 21:48:46', name: '阿留教育规划3天精华课', qrAssigned: true, productId: '71967409586', status: '在线', storeName: '阿留状元教育规划', storeType: '百家号', ipNo: 'IP000001', ipName: '阿留皮皮', remark: '店播主推商品' },
  { id: 2, createdAt: '2026-08-20 19:34:08', updatedAt: '2026-08-20 19:34:09', name: '阿留教育规划精华家长课-读书卡', qrAssigned: true, productId: '3825549661721198679', status: '在线', storeName: '熹瑶严选', storeType: '抖店', ipNo: 'IP000001', ipName: '阿留皮皮', remark: '' },
  { id: 3, createdAt: '2026-08-19 15:12:30', updatedAt: '2026-08-20 09:06:18', name: '家庭教育直播体验课', qrAssigned: false, productId: 'YZ-LIVE-0822', status: '在线', storeName: '合数精品课程店', storeType: '有赞', ipNo: 'IP000001', ipName: '阿留皮皮', remark: '等待活码配置' },
  { id: 4, createdAt: '2026-08-18 10:21:05', updatedAt: '2026-08-18 10:21:05', name: '亲子沟通训练营', qrAssigned: true, productId: 'XET-PARENT-03', status: '在线', storeName: '合数成长课堂', storeType: '小鹅通', ipNo: 'IP000001', ipName: '阿留皮皮', remark: '' },
  { id: 5, createdAt: '2026-08-17 12:30:40', updatedAt: '2026-08-20 12:30:40', name: '学习力诊断课', qrAssigned: true, productId: 'DY-STUDY-100', status: '在线', storeName: '合数教育官方旗舰店', storeType: '抖店', ipNo: 'IP000002', ipName: '周老师', remark: '' },
  { id: 6, createdAt: '2026-08-16 08:45:10', updatedAt: '2026-08-19 18:01:22', name: '高效学习训练营', qrAssigned: false, productId: 'XET-STUDY-21', status: '在线', storeName: '合数成长课堂', storeType: '小鹅通', ipNo: 'IP000002', ipName: '周老师', remark: '' },
  { id: 7, createdAt: '2026-08-15 16:20:17', updatedAt: '2026-08-20 14:09:52', name: '父母成长公开课', qrAssigned: false, productId: 'XHS-PARENT-06', status: '下线', storeName: '合数教育体验课', storeType: '小红书', ipNo: 'IP000003', ipName: '王老师', remark: '历史商品，仅保留归因关系' },
  { id: 8, createdAt: '2026-08-14 13:38:12', updatedAt: '2026-08-18 11:16:21', name: '1V1升学诊断', qrAssigned: true, productId: 'XHS-PLAN-01', status: '在线', storeName: '合数教育体验课', storeType: '小红书', ipNo: 'IP000003', ipName: '王老师', remark: '' }
])

const query = reactive({ keyword: '', storeType: '', status: '', qrAssigned: '', ipNo: '' })
const storeTypes = computed(() => [...new Set(rows.value.map(row => row.storeType))])
const ipOptions = computed(() => [...new Map(rows.value.map(row => [row.ipNo, { no: row.ipNo, name: row.ipName }])).values()])
const activeIp = computed(() => ipOptions.value.find(item => item.no === query.ipNo))
const filteredRows = computed(() => {
  const term = query.keyword.trim().toLowerCase()
  return rows.value.filter(row => (!term || `${row.name}${row.productId}${row.storeName}`.toLowerCase().includes(term))
    && (!query.storeType || row.storeType === query.storeType)
    && (!query.status || row.status === query.status)
    && (query.qrAssigned === '' || row.qrAssigned === (query.qrAssigned === 'true'))
    && (!query.ipNo || row.ipNo === query.ipNo))
})
const pagedRows = computed(() => filteredRows.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))

watch(() => route.query.ipNo, value => { query.ipNo = typeof value === 'string' ? value : ''; page.value = 1 }, { immediate: true })
watch(() => [query.keyword, query.storeType, query.status, query.qrAssigned, query.ipNo], () => { page.value = 1 })

function resetQuery() { Object.assign(query, { keyword: '', storeType: '', status: '', qrAssigned: '', ipNo: '' }) }
function syncProducts() {
  loading.value = true
  window.setTimeout(() => { loading.value = false; ElMessage.success('商品同步任务已完成，数据已刷新') }, 650)
}
function openRemark(row: ProductRow) { activeProduct.value = row; remark.value = row.remark; remarkVisible.value = true }
function saveRemark() {
  if (activeProduct.value) activeProduct.value.remark = remark.value.trim()
  remarkVisible.value = false
  ElMessage.success('商品备注已更新')
}
function exportRows() { ElMessage.success(`已创建 ${filteredRows.value.length} 条商品的导出任务`) }
</script>

<template>
  <section class="page product-page">
    <PageHeader title="商品列表" description="统一查看第三方商品、店铺归属、活码分配状态与IP关联，商品主数据由各渠道同步进入。">
      <el-button :icon="Download" @click="exportRows">导出</el-button>
      <el-button type="primary" :icon="Refresh" :loading="loading" @click="syncProducts">同步商品</el-button>
    </PageHeader>

    <div v-if="activeIp" class="ip-context">
      <span>当前IP</span><code>{{ activeIp.no }}</code><b>{{ activeIp.name }}</b>
      <button type="button" @click="query.ipNo = ''">查看全部商品</button>
    </div>

    <div class="product-filter surface">
      <el-input v-model="query.keyword" clearable :prefix-icon="Search" placeholder="商品名称、商品ID或店铺名称" />
      <el-select v-model="query.storeType" clearable placeholder="店铺类型"><el-option v-for="item in storeTypes" :key="item" :label="item" :value="item" /></el-select>
      <el-select v-model="query.status" clearable placeholder="商品状态"><el-option label="在线" value="在线"/><el-option label="下线" value="下线"/></el-select>
      <el-select v-model="query.qrAssigned" clearable placeholder="活码分配"><el-option label="已分配" value="true"/><el-option label="未分配" value="false"/></el-select>
      <el-select v-model="query.ipNo" clearable filterable placeholder="关联IP"><el-option v-for="item in ipOptions" :key="item.no" :label="`${item.name} · ${item.no}`" :value="item.no" /></el-select>
      <el-button type="primary">查询</el-button><el-button @click="resetQuery">重置</el-button>
    </div>

    <article class="product-ledger surface">
      <header><div><h3>商品主档</h3><span>共 {{ filteredRows.length }} 条</span></div><p>商品ID与店铺共同确定外部商品身份</p></header>
      <el-table v-loading="loading" :data="pagedRows" row-key="id">
        <el-table-column type="index" label="序号" width="70" :index="(index: number) => (page - 1) * pageSize + index + 1" />
        <el-table-column prop="createdAt" label="创建时间" width="155" />
        <el-table-column prop="updatedAt" label="更新时间" width="155" />
        <el-table-column label="商品名称" min-width="220"><template #default="{ row }"><div class="product-name"><b>{{ row.name }}</b><small v-if="row.remark">{{ row.remark }}</small></div></template></el-table-column>
        <el-table-column label="是否分配活码" width="125" align="center"><template #default="{ row }"><el-tag :type="row.qrAssigned ? 'success' : 'info'" effect="plain">{{ row.qrAssigned ? '是' : '否' }}</el-tag></template></el-table-column>
        <el-table-column prop="productId" label="商品ID" min-width="165"><template #default="{ row }"><code>{{ row.productId }}</code></template></el-table-column>
        <el-table-column label="商品状态" width="100"><template #default="{ row }"><el-tag :type="row.status === '在线' ? 'success' : 'info'">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column prop="storeName" label="店铺名称" min-width="180" />
        <el-table-column prop="storeType" label="店铺类型" width="105" />
        <el-table-column label="关联IP" width="145"><template #default="{ row }"><div class="ip-cell"><b>{{ row.ipName }}</b><code>{{ row.ipNo }}</code></div></template></el-table-column>
        <el-table-column label="操作" width="110" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openRemark(row)">修改备注</el-button></template></el-table-column>
      </el-table>
      <footer><el-pagination v-model:current-page="page" v-model:page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :total="filteredRows.length" :page-sizes="[10, 20, 50]" /></footer>
    </article>

    <el-dialog v-model="remarkVisible" title="修改商品备注" width="520px">
      <div class="remark-product"><b>{{ activeProduct?.name }}</b><code>{{ activeProduct?.productId }}</code></div>
      <el-input v-model="remark" type="textarea" :rows="4" maxlength="100" show-word-limit placeholder="请输入内部备注，不会同步至第三方平台" />
      <template #footer><el-button @click="remarkVisible = false">取消</el-button><el-button type="primary" @click="saveRemark">保存备注</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>
.product-page{--ink:#152640;--blue:#2875e6}.ip-context{display:flex;align-items:center;gap:10px;padding:12px 16px;margin-bottom:14px;border:1px solid #cfe0f7;border-left:4px solid var(--blue);border-radius:9px;background:#f4f8ff;color:#6d7e96;font-size:12px}.ip-context code,.product-ledger code,.remark-product code{padding:4px 7px;border:1px solid #dae5f2;border-radius:6px;background:#f2f6fb;color:#426790;font:700 10px ui-monospace,SFMono-Regular,Menlo,monospace}.ip-context b{color:var(--ink)}.ip-context button{margin-left:auto;border:0;background:none;color:var(--blue);font-weight:700;cursor:pointer}.product-filter{display:grid;grid-template-columns:1.5fr repeat(4,.72fr) auto auto;gap:9px;padding:14px 16px;margin-bottom:14px}.product-ledger{padding:0 18px 18px}.product-ledger>header{height:62px;display:flex;align-items:center;justify-content:space-between}.product-ledger header>div{display:flex;align-items:baseline;gap:9px}.product-ledger h3{margin:0;color:var(--ink)}.product-ledger header span,.product-ledger header p{color:#8b99ab;font-size:10px}.product-ledger footer{display:flex;justify-content:flex-end;padding-top:18px}.product-name b,.product-name small,.ip-cell b,.ip-cell code{display:block}.product-name b{color:var(--ink)}.product-name small{margin-top:5px;color:#8796aa;font-size:10px}.ip-cell b{margin-bottom:5px;color:var(--ink);font-size:12px}.ip-cell code{width:max-content;padding:2px 5px;font-size:8px}.remark-product{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;margin-bottom:14px;border-radius:8px;background:#f5f8fc}.remark-product b{color:var(--ink)}@media(max-width:1200px){.product-filter{grid-template-columns:repeat(3,1fr)}}
</style>
