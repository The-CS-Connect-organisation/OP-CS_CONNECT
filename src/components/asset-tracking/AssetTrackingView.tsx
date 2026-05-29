import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Monitor, Smartphone, Printer, Wifi, Tv, Package, Search, Plus, X, Check,
  Edit2, Trash2, AlertTriangle, PackageCheck, PackageOpen, Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Asset {
  id: string
  name: string
  type: string
  model: string
  serialNumber: string
  location: string
  status: 'available' | 'in-use' | 'maintenance' | 'retired'
  assignedTo: string
  purchaseDate: string
  value: number
  notes: string
}

const assetIcons: Record<string, any> = {
  monitor: Monitor, laptop: Monitor, computer: Monitor,
  printer: Printer, phone: Smartphone,
  network: Wifi, router: Wifi, switch: Wifi,
  tv: Tv, projector: Tv,
  other: Package
}

const statusColors: Record<string, string> = {
  'available': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  'in-use': 'bg-orange-500/10 text-orange-600 border-orange-200',
  'maintenance': 'bg-amber-500/10 text-amber-600 border-amber-200',
  'retired': 'bg-red-500/10 text-red-600 border-red-200',
}

export default function AssetTrackingView({ role }: { role: string }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [form, setForm] = useState({ name: '', type: '', model: '', serialNumber: '', location: '', status: 'available' as Asset['status'], assignedTo: '', purchaseDate: '', value: 0, notes: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await api.getAssets().catch(() => [])
      setAssets(data)
    } finally {
      setLoading(false)
    }
  }

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', type: '', model: '', serialNumber: '', location: '', status: 'available', assignedTo: '', purchaseDate: '', value: 0, notes: '' })
    setShowForm(true)
  }

  const openEdit = (asset: Asset) => {
    setEditing(asset)
    setForm({ name: asset.name, type: asset.type, model: asset.model, serialNumber: asset.serialNumber, location: asset.location, status: asset.status, assignedTo: asset.assignedTo, purchaseDate: asset.purchaseDate, value: asset.value, notes: asset.notes })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.type) return
    try {
      if (editing) {
        await api.updateAsset(editing.id, form)
      } else {
        await api.createAsset(form)
      }
      setShowForm(false)
      setEditing(null)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset?')) return
    try {
      await api.deleteAsset(id)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.serialNumber.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const IconComponent = (type: string) => {
    const key = Object.entries(assetIcons).find(([k]) => type.toLowerCase().includes(k))?.[1]
    return key || Package
  }

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Asset Tracking</h1>
          <p className="text-muted-foreground text-sm">Track and manage school assets & inventory</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Add Asset</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="flex gap-2">
          {['all', 'available', 'in-use', 'maintenance', 'retired'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                statusFilter === s ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:bg-accent")}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: assets.length, color: 'text-foreground' },
          { label: 'Available', value: assets.filter(a => a.status === 'available').length, color: 'text-emerald-600' },
          { label: 'In Use', value: assets.filter(a => a.status === 'in-use').length, color: 'text-orange-600' },
          { label: 'Maintenance', value: assets.filter(a => a.status === 'maintenance').length, color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="p-4 card-hover">
            <p className="text-2xl font-bold stat-value">{s.value}</p>
            <p className={cn("text-xs font-medium mt-1", s.color)}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Asset List */}
      <div className="space-y-2">
        {filtered.map(asset => {
          const Icon = IconComponent(asset.type)
          return (
            <Card key={asset.id} className="p-4 card-hover">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{asset.name}</span>
                    <Badge className={cn("text-[10px]", statusColors[asset.status])}>
                      {asset.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                    <span>{asset.model}</span>
                    <span>SN: {asset.serialNumber}</span>
                    <span>{asset.location}</span>
                    {asset.assignedTo && <span>→ {asset.assignedTo}</span>}
                    {asset.value > 0 && <span>${asset.value.toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(asset)} className="p-2 rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-foreground">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(asset.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No assets found</p>
          </div>
        )}
      </div>

      {/* Asset Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg bg-card rounded-2xl p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Asset' : 'Add Asset'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium">Asset Name *</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Dell Monitor" />
              </div>
              <div>
                <label className="text-sm font-medium">Type *</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-background border text-sm outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Select...</option>
                  <option value="monitor">Monitor</option>
                  <option value="laptop">Laptop</option>
                  <option value="computer">Computer</option>
                  <option value="printer">Printer</option>
                  <option value="phone">Phone</option>
                  <option value="network">Network Equipment</option>
                  <option value="tv">TV/Projector</option>
                  <option value="furniture">Furniture</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value as Asset['status']})}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-background border text-sm outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Model</label>
                <Input value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Serial Number</label>
                <Input value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Room 201" />
              </div>
              <div>
                <label className="text-sm font-medium">Assigned To</label>
                <Input value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Purchase Date</label>
                <Input type="date" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Value ($)</label>
                <Input type="number" value={form.value} onChange={e => setForm({...form, value: Number(e.target.value)})} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-background border text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={!form.name || !form.type}>
                <Check className="w-4 h-4 mr-2" />{editing ? 'Update' : 'Add'} Asset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
