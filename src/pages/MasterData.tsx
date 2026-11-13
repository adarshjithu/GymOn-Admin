import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Sparkles,
  Layers,
  Activity,
  X,
} from 'lucide-react';
import type {
  MasterCity,
  MasterFacility,
  MasterGymType,
  MasterCrowdLevel,
} from '../types';
import { adminApi } from '../api/adminApi';

interface MasterDataProps {
  initialTab?: 'cities' | 'facilities' | 'gym-types' | 'crowd-levels';
}

export default function MasterData({ initialTab = 'cities' }: MasterDataProps) {
  const { subTab } = useParams<{ subTab?: string }>();
  const navigate = useNavigate();

  const activeTab: 'cities' | 'facilities' | 'gym-types' | 'crowd-levels' =
    subTab === 'facilities'
      ? 'facilities'
      : subTab === 'gym-types'
      ? 'gym-types'
      : subTab === 'crowd-levels'
      ? 'crowd-levels'
      : initialTab;

  // States
  const [cities, setCities] = useState<MasterCity[]>([]);
  const [facilities, setFacilities] = useState<MasterFacility[]>([]);
  const [gymTypes, setGymTypes] = useState<MasterGymType[]>([]);
  const [crowdLevels, setCrowdLevels] = useState<MasterCrowdLevel[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [c, f, gt, cl] = await Promise.all([
        adminApi.getCities(),
        adminApi.getFacilities(),
        adminApi.getGymTypes(),
        adminApi.getCrowdLevels(),
      ]);
      setCities(Array.isArray(c) ? c : []);
      setFacilities(Array.isArray(f) ? f : []);
      setGymTypes(Array.isArray(gt) ? gt : []);
      setCrowdLevels(Array.isArray(cl) ? cl : []);
    } catch (err) {
      console.error(err);
      setCities([]);
      setFacilities([]);
      setGymTypes([]);
      setCrowdLevels([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      if (activeTab === 'cities') {
        await adminApi.createCity(newItemName.trim());
        adminApi.addActivityLog('Added City', `Added city ${newItemName.trim()}`);
        setFeedback(`City "${newItemName}" added successfully.`);
      } else if (activeTab === 'facilities') {
        await adminApi.createFacility(newItemName.trim());
        adminApi.addActivityLog('Added Facility', `Added facility ${newItemName.trim()}`);
        setFeedback(`Facility "${newItemName}" added successfully.`);
      } else if (activeTab === 'gym-types') {
        await adminApi.createGymType(newItemName.trim());
        adminApi.addActivityLog('Added Gym Type', `Added gym type ${newItemName.trim()}`);
        setFeedback(`Gym Type "${newItemName}" added successfully.`);
      } else if (activeTab === 'crowd-levels') {
        await adminApi.createCrowdLevel(newItemName.trim());
        adminApi.addActivityLog('Added Crowd Level', `Added level ${newItemName.trim()}`);
        setFeedback(`Crowd Level "${newItemName}" added successfully.`);
      }
      setNewItemName('');
      setIsAddModalOpen(false);
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to add');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      if (activeTab === 'cities') await adminApi.deleteCity(id);
      if (activeTab === 'facilities') await adminApi.deleteFacility(id);
      if (activeTab === 'gym-types') await adminApi.deleteGymType(id);
      if (activeTab === 'crowd-levels') await adminApi.deleteCrowdLevel(id);

      adminApi.addActivityLog('Deleted Master Data', `Deleted ${name}`);
      setFeedback(`"${name}" deleted successfully.`);
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete');
    }
  };

  const getSubTitleTag = () => {
    switch (activeTab) {
      case 'cities':
        return 'SA-008a Master Data - Cities';
      case 'facilities':
        return 'SA-008b Master Data - Facilities';
      case 'gym-types':
        return 'SA-008c Master Data - Gym Types';
      case 'crowd-levels':
        return 'SA-008d Master Data - Crowd Levels';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Spec Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {getSubTitleTag()}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Master Data
          </h1>
        </div>

        {/* Sub-tabs pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => navigate('/master-data/cities')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'cities'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="h-3.5 w-3.5 text-[#00A389]" />
            <span>Cities</span>
          </button>
          <button
            onClick={() => navigate('/master-data/facilities')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'facilities'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#00A389]" />
            <span>Facilities</span>
          </button>
          <button
            onClick={() => navigate('/master-data/gym-types')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'gym-types'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-[#00A389]" />
            <span>Gym Types</span>
          </button>
          <button
            onClick={() => navigate('/master-data/crowd-levels')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'crowd-levels'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-[#00A389]" />
            <span>Crowd Levels</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Search & Add Action Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-none sm:max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${
              activeTab === 'cities'
                ? 'city'
                : activeTab === 'facilities'
                ? 'facility'
                : activeTab === 'gym-types'
                ? 'gym type'
                : 'crowd level'
            }...`}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00A389] hover:bg-[#008f77] shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>
            Add{' '}
            {activeTab === 'cities'
              ? 'City'
              : activeTab === 'facilities'
              ? 'Facility'
              : activeTab === 'gym-types'
              ? 'Gym Type'
              : 'Level'}
          </span>
        </button>
      </div>

      {/* MASTER DATA TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">
                  {activeTab === 'cities'
                    ? 'City Name'
                    : activeTab === 'facilities'
                    ? 'Facility Name'
                    : activeTab === 'gym-types'
                    ? 'Gym Type'
                    : 'Crowd Level'}
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created On</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {/* CITIES */}
              {activeTab === 'cities' &&
                (cities || [])
                  .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-800">{item.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{item.createdOn}</td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => alert(`Edit ${item.name}`)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

              {/* FACILITIES */}
              {activeTab === 'facilities' &&
                (facilities || [])
                  .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-800">{item.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{item.createdOn}</td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => alert(`Edit ${item.name}`)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

              {/* GYM TYPES */}
              {activeTab === 'gym-types' &&
                (gymTypes || [])
                  .filter((gt) => gt.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-800">{item.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{item.createdOn}</td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => alert(`Edit ${item.name}`)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

              {/* CROWD LEVELS */}
              {activeTab === 'crowd-levels' &&
                (crowdLevels || [])
                  .filter((cl) => cl.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-800">{item.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{item.createdOn}</td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => alert(`Edit ${item.name}`)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Footer pagination info */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing 1 to{' '}
            {activeTab === 'cities'
              ? cities.length
              : activeTab === 'facilities'
              ? facilities.length
              : activeTab === 'gym-types'
              ? gymTypes.length
              : crowdLevels.length}{' '}
            items
          </div>
          <div className="flex items-center space-x-1">
            <span className="px-2.5 py-1 bg-[#00A389] text-white rounded font-bold text-xs">
              1
            </span>
          </div>
        </div>
      </div>

      {/* ADD ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Add{' '}
                {activeTab === 'cities'
                  ? 'City'
                  : activeTab === 'facilities'
                  ? 'Facility'
                  : activeTab === 'gym-types'
                  ? 'Gym Type'
                  : 'Crowd Level'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`Enter ${
                    activeTab === 'cities'
                      ? 'city name (e.g. Alappuzha)'
                      : activeTab === 'facilities'
                      ? 'facility name'
                      : 'name'
                  }`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00A389] hover:bg-[#008f77] shadow-xs cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
