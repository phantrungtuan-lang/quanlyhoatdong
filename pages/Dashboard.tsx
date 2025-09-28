

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../App';
import { UserRole, Profile, Department, Teacher, SchoolYear, Activity, Participation, ParticipationStatus } from '../types';
import { supabase } from '../services/supabase';
import { Button, Card, CardHeader, Input, Modal, Select, Spinner } from '../components/ui';
import { PARTICIPATION_STATUSES } from '../constants';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- ICONS (Normally in a separate file) ---
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>;
const BuildingOfficeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2 0h2v2h-2V9zm2-4h-2v2h2V5z" clipRule="evenodd" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm5-3a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1zm5-3a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM2 15a1 1 0 011-1h12a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

// --- HELPER HOOK for fetching data ---
function useSupabaseData<T>(fetcher: () => Promise<T[] | null>, deps: any[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refresh: fetchData };
}

// --- ADMIN COMPONENTS ---

const DepartmentManager: React.FC = () => {
  const { data: departments, loading, refresh } = useSupabaseData(async () => {
    const { data, error } = await supabase.from('departments').select('*').order('name');
    if (error) throw error;
    return data;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDept, setCurrentDept] = useState<Partial<Department> | null>(null);
  const [name, setName] = useState('');

  const handleOpenModal = (dept: Partial<Department> | null = null) => {
    setCurrentDept(dept);
    setName(dept?.name || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentDept(null);
    setName('');
  };

  const handleSubmit = async () => {
    if (!name) return;
    const { error } = currentDept?.id
      ? await supabase.from('departments').update({ name }).eq('id', currentDept.id)
      : await supabase.from('departments').insert({ name });

    if (!error) {
      refresh();
      handleCloseModal();
    } else {
      alert(error.message);
    }
  };
  
  const handleDelete = async (id: string) => {
      if (window.confirm('Are you sure you want to delete this department? This might affect existing teachers.')) {
          const { error } = await supabase.from('departments').delete().eq('id', id);
          if (!error) {
              refresh();
          } else {
              alert(error.message);
          }
      }
  };

  return (
    <Card>
      <CardHeader title="Quản lý Tổ/Phòng ban">
        <Button onClick={() => handleOpenModal()}><PlusIcon /> Thêm mới</Button>
      </CardHeader>
      {loading && <Spinner />}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên Tổ</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày tạo</th>
              <th className="py-3 px-6 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-slate-900">{dept.name}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-slate-500">{new Date(dept.created_at).toLocaleDateString()}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-right space-x-2">
                    <Button variant="secondary" className="px-2 py-1" onClick={() => handleOpenModal(dept)}><PencilIcon /></Button>
                    <Button variant="danger" className="px-2 py-1" onClick={() => handleDelete(dept.id)}><TrashIcon /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentDept?.id ? 'Chỉnh sửa Tổ' : 'Thêm Tổ mới'}>
        <div className="space-y-4">
          <Input label="Tên Tổ" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleCloseModal}>Hủy</Button>
            <Button onClick={handleSubmit}>Lưu</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

const TeacherManager: React.FC = () => {
    const { data: teachers, loading, refresh } = useSupabaseData(async () => {
        const { data, error } = await supabase.from('teachers').select('*, departments(name)').order('full_name');
        if (error) throw error;
        return data as Teacher[];
    });
    
    const { data: departments } = useSupabaseData(async () => {
        const { data, error } = await supabase.from('departments').select('*');
        if (error) throw error;
        return data;
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState<Partial<Teacher> | null>(null);
    const [formData, setFormData] = useState({ full_name: '', employee_id: '', department_id: '' });

    const handleOpenModal = (teacher: Partial<Teacher> | null = null) => {
        setCurrentTeacher(teacher);
        setFormData({
            full_name: teacher?.full_name || '',
            employee_id: teacher?.employee_id || '',
            department_id: teacher?.department_id || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTeacher(null);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.full_name || !formData.employee_id || !formData.department_id) return;
        
        const { error } = currentTeacher?.id
            ? await supabase.from('teachers').update(formData).eq('id', currentTeacher.id)
            : await supabase.from('teachers').insert(formData);

        if (!error) {
            refresh();
            handleCloseModal();
        } else {
            alert(error.message);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure? This may affect participation records.')) {
            const { error } = await supabase.from('teachers').delete().eq('id', id);
            if (!error) refresh();
            else alert(error.message);
        }
    };

    const handleExport = () => {
        const dataToExport = teachers.map(teacher => ({
            "Mã nhân viên": teacher.employee_id,
            "Tên giáo viên": teacher.full_name,
            "Tên tổ": teacher.departments?.name || ''
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Danh sách giáo viên");
        XLSX.writeFile(wb, "Danh_sach_giao_vien.xlsx");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = () => {
        if (!file) return;
        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            const deptMap = new Map(departments.map(d => [d.name.toLowerCase(), d.id]));
            
            const newTeachers = json.map(row => ({
                full_name: row['Tên giáo viên'],
                employee_id: String(row['Mã nhân viên']),
                department_id: deptMap.get(String(row['Tên tổ']).toLowerCase())
            })).filter(t => t.full_name && t.employee_id && t.department_id);

            if (newTeachers.length > 0) {
                const { error } = await supabase.from('teachers').upsert(newTeachers, { onConflict: 'employee_id' });
                if (error) {
                    alert('Import failed: ' + error.message);
                } else {
                    alert(`Import successful! ${newTeachers.length} records processed.`);
                    refresh();
                    setIsImportModalOpen(false);
                }
            } else {
                alert('No valid teacher data found in the file.');
            }
            setIsUploading(false);
        };
        reader.readAsBinaryString(file);
    };
    
    const downloadTemplate = () => {
        const ws = XLSX.utils.aoa_to_sheet([["Mã nhân viên", "Tên giáo viên", "Tên tổ"]]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Teachers");
        XLSX.writeFile(wb, "Teacher_Import_Template.xlsx");
    };

    return (
        <Card>
            <CardHeader title="Quản lý Giáo viên">
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleExport}><DownloadIcon /> Export Excel</Button>
                    <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}><UploadIcon /> Import Excel</Button>
                    <Button onClick={() => handleOpenModal()}><PlusIcon /> Thêm mới</Button>
                </div>
            </CardHeader>
            {loading && <Spinner />}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="py-3 px-6 text-left">Mã NV</th>
                            <th className="py-3 px-6 text-left">Tên Giáo viên</th>
                            <th className="py-3 px-6 text-left">Tổ</th>
                            <th className="py-3 px-6 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                    {teachers.map((teacher) => (
                        <tr key={teacher.id}>
                            <td className="py-4 px-6">{teacher.employee_id}</td>
                            <td className="py-4 px-6">{teacher.full_name}</td>
                            <td className="py-4 px-6">{teacher.departments?.name}</td>
                            <td className="py-4 px-6 text-right space-x-2">
                                <Button variant="secondary" className="px-2 py-1" onClick={() => handleOpenModal(teacher)}><PencilIcon /></Button>
                                <Button variant="danger" className="px-2 py-1" onClick={() => handleDelete(teacher.id)}><TrashIcon /></Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentTeacher?.id ? 'Chỉnh sửa Giáo viên' : 'Thêm Giáo viên'}>
                <div className="space-y-4">
                    <Input label="Mã nhân viên" name="employee_id" value={formData.employee_id} onChange={handleChange} />
                    <Input label="Tên Giáo viên" name="full_name" value={formData.full_name} onChange={handleChange} />
                    <Select label="Tổ" name="department_id" value={formData.department_id} onChange={handleChange}>
                        <option value="">Chọn tổ</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </Select>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={handleCloseModal}>Hủy</Button>
                        <Button onClick={handleSubmit}>Lưu</Button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Giáo viên từ Excel">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">Chọn file Excel (.xlsx) với các cột: "Mã nhân viên", "Tên giáo viên", "Tên tổ".</p>
                    <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                    <Button variant="secondary" onClick={downloadTemplate} className="w-full"><DownloadIcon /> Tải file mẫu</Button>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleImport} disabled={!file || isUploading}>
                            {isUploading ? <Spinner size="sm" /> : "Import"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </Card>
    );
};

const SchoolYearManager: React.FC = () => { /* Similar CRUD structure as DepartmentManager */ 
  const { data: years, loading, refresh } = useSupabaseData(async () => {
    const { data, error } = await supabase.from('school_years').select('*').order('name', { ascending: false });
    if (error) throw error;
    return data;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState<Partial<SchoolYear> | null>(null);
  const [formData, setFormData] = useState({ name: '', start_date: '', end_date: '' });

  const handleOpenModal = (year: Partial<SchoolYear> | null = null) => {
    setCurrentYear(year);
    setFormData({
        name: year?.name || '',
        start_date: year?.start_date || '',
        end_date: year?.end_date || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentYear(null);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    const { error } = currentYear?.id
      ? await supabase.from('school_years').update(formData).eq('id', currentYear.id)
      : await supabase.from('school_years').insert(formData);

    if (!error) {
      refresh();
      handleCloseModal();
    } else {
      alert(error.message);
    }
  };

    return (
        <Card>
            <CardHeader title="Quản lý Năm học">
                <Button onClick={() => handleOpenModal()}><PlusIcon /> Thêm Năm học</Button>
            </CardHeader>
            {loading && <Spinner />}
            <table className="min-w-full">
                {/* table header */}
                <thead className="bg-slate-50"><tr><th className="py-3 px-6 text-left">Tên Năm học</th><th className="py-3 px-6 text-left">Ngày bắt đầu</th><th className="py-3 px-6 text-left">Ngày kết thúc</th><th className="py-3 px-6 text-right">Hành động</th></tr></thead>
                <tbody className="divide-y divide-slate-200">
                    {years.map(year => (
                        <tr key={year.id}>
                            <td className="py-4 px-6">{year.name}</td>
                            <td className="py-4 px-6">{year.start_date}</td>
                            <td className="py-4 px-6">{year.end_date}</td>
                            <td className="py-4 px-6 text-right space-x-2">
                                <Button variant="secondary" className="px-2 py-1" onClick={() => handleOpenModal(year)}><PencilIcon /></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentYear?.id ? 'Sửa Năm học' : 'Thêm Năm học'}>
                <div className="space-y-4">
                    <Input label="Tên Năm học (e.g., 2023-2024)" name="name" value={formData.name} onChange={handleChange} />
                    <Input label="Ngày bắt đầu" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
                    <Input label="Ngày kết thúc" name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
                    <div className="flex justify-end gap-2"><Button variant="secondary" onClick={handleCloseModal}>Hủy</Button><Button onClick={handleSubmit}>Lưu</Button></div>
                </div>
            </Modal>
        </Card>
    );
}

const ActivityManager: React.FC = () => { /* Similar CRUD structure */ 
    const { data: activities, loading, refresh } = useSupabaseData(async () => {
        const { data, error } = await supabase.from('activities').select('*, school_years(name)').order('date', { ascending: false });
        if (error) throw error;
        return data as (Activity & { school_years: { name: string } })[];
    });

    const { data: schoolYears } = useSupabaseData(async () => {
        const { data, error } = await supabase.from('school_years').select('*').order('name', { ascending: false });
        if (error) throw error;
        return data;
    });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentActivity, setCurrentActivity] = useState<Partial<Activity> | null>(null);
    const [formData, setFormData] = useState({ name: '', date: '', description: '', school_year_id: '' });

    const handleOpenModal = (activity: Partial<Activity> | null = null) => {
        setCurrentActivity(activity);
        setFormData({
            name: activity?.name || '',
            date: activity?.date ? activity.date.split('T')[0] : '',
            description: activity?.description || '',
            school_year_id: activity?.school_year_id || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.date || !formData.school_year_id) return;
        const { error } = currentActivity?.id
            ? await supabase.from('activities').update(formData).eq('id', currentActivity.id)
            : await supabase.from('activities').insert(formData);

        if (!error) {
            refresh();
            handleCloseModal();
        } else {
            alert(error.message);
        }
    };
    
    return (
        <Card>
            <CardHeader title="Quản lý Hoạt động">
                <Button onClick={() => handleOpenModal()}><PlusIcon /> Thêm Hoạt động</Button>
            </CardHeader>
            {loading && <Spinner />}
            <table className="min-w-full">
                <thead className="bg-slate-50"><tr><th className="py-3 px-6 text-left">Tên hoạt động</th><th className="py-3 px-6 text-left">Ngày</th><th className="py-3 px-6 text-left">Năm học</th><th className="py-3 px-6 text-right">Hành động</th></tr></thead>
                <tbody className="divide-y divide-slate-200">
                {activities.map(act => (
                    <tr key={act.id}>
                        <td className="py-4 px-6">{act.name}</td>
                        <td className="py-4 px-6">{new Date(act.date).toLocaleDateString()}</td>
                        <td className="py-4 px-6">{act.school_years.name}</td>
                        <td className="py-4 px-6 text-right space-x-2"><Button variant="secondary" className="px-2 py-1" onClick={() => handleOpenModal(act)}><PencilIcon /></Button></td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentActivity?.id ? 'Sửa Hoạt động' : 'Thêm Hoạt động'}>
                <div className="space-y-4">
                    <Select label="Năm học" name="school_year_id" value={formData.school_year_id} onChange={handleChange}>
                        <option value="">Chọn năm học</option>
                        {schoolYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                    </Select>
                    <Input label="Tên hoạt động" name="name" value={formData.name} onChange={handleChange} />
                    <Input label="Ngày diễn ra" name="date" type="date" value={formData.date} onChange={handleChange} />
                    <div className="flex justify-end gap-2"><Button variant="secondary" onClick={handleCloseModal}>Hủy</Button><Button onClick={handleSubmit}>Lưu</Button></div>
                </div>
            </Modal>
        </Card>
    );
}


// --- SHARED COMPONENTS ---

const ParticipationManager: React.FC<{ profile: Profile }> = ({ profile }) => {
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedActivity, setSelectedActivity] = useState('');

    const { data: schoolYears } = useSupabaseData(async () => {
        const { data, error } = await supabase.from('school_years').select('id, name').order('name', { ascending: false });
        if (error) throw error;
        return data;
    });

    const { data: activities } = useSupabaseData(async () => {
        if (!selectedYear) return [];
        const { data, error } = await supabase.from('activities').select('id, name').eq('school_year_id', selectedYear).order('date', { ascending: false });
        if (error) throw error;
        return data;
    }, [selectedYear]);

    const { data: teachers, loading: teachersLoading } = useSupabaseData(async () => {
        if (!selectedActivity) return [];
        // FIX: Select all teacher fields (*) to match the Teacher type, which requires employee_id and department_id.
        let query = supabase.from('teachers').select('*, departments(name)');
        if (profile.role === UserRole.DEPT_HEAD) {
            query = query.eq('department_id', profile.department_id!);
        }
        const { data, error } = await query.order('full_name');
        if (error) throw error;
        return data as Teacher[];
    }, [selectedActivity, profile.role, profile.department_id]);

    const { data: participations, refresh: refreshParticipations } = useSupabaseData(async () => {
        if (!selectedActivity) return [];
        const { data, error } = await supabase.from('participations').select('*').eq('activity_id', selectedActivity);
        if (error) throw error;
        return data;
    }, [selectedActivity]);
    
    const participationMap = useMemo(() => {
        return new Map(participations.map(p => [p.teacher_id, p.status]));
    }, [participations]);

    const handleStatusChange = async (teacher_id: string, status: ParticipationStatus) => {
        const { error } = await supabase.from('participations').upsert({
            teacher_id,
            activity_id: selectedActivity,
            status
        }, { onConflict: 'teacher_id,activity_id' });
        
        if (error) {
            alert(error.message);
        } else {
            refreshParticipations();
        }
    };
    
    return (
        <Card>
            <CardHeader title="Cập nhật Tình trạng Tham gia" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Select label="Chọn Năm học" value={selectedYear} onChange={e => { setSelectedYear(e.target.value); setSelectedActivity(''); }}>
                    <option value="">-- Tất cả --</option>
                    {schoolYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </Select>
                <Select label="Chọn Hoạt động" value={selectedActivity} onChange={e => setSelectedActivity(e.target.value)} disabled={!selectedYear}>
                    <option value="">-- Tất cả --</option>
                    {activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
            </div>

            {selectedActivity && (
                teachersLoading ? <Spinner /> : (
                    <div className="overflow-x-auto mt-6">
                        <table className="min-w-full">
                            <thead className="bg-slate-50"><tr><th className="py-3 px-6 text-left">Giáo viên</th>{profile.role === UserRole.ADMIN && <th className="py-3 px-6 text-left">Tổ</th>}<th className="py-3 px-6 text-left">Trạng thái</th></tr></thead>
                            <tbody className="divide-y divide-slate-200">
                                {teachers.map(teacher => (
                                    <tr key={teacher.id}>
                                        <td className="py-4 px-6">{teacher.full_name}</td>
                                        {profile.role === UserRole.ADMIN && <td className="py-4 px-6">{teacher.departments?.name}</td>}
                                        <td className="py-4 px-6">
                                            <Select value={participationMap.get(teacher.id) || ''} onChange={e => handleStatusChange(teacher.id, e.target.value as ParticipationStatus)}>
                                                <option value="">-- Chọn --</option>
                                                {Object.values(ParticipationStatus).map(status => (
                                                    <option key={status} value={status}>{PARTICIPATION_STATUSES[status].label}</option>
                                                ))}
                                            </Select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </Card>
    );
};

const ReportViewer: React.FC<{ profile: Profile }> = ({ profile }) => {
    const [filters, setFilters] = useState({ yearId: '', activityId: '' });
    
    const { data: schoolYears } = useSupabaseData(async () => {
        const { data, error } = await supabase.from('school_years').select('id, name').order('name', { ascending: false });
        if (error) throw error;
        return data;
    });

    const { data: activities } = useSupabaseData(async () => {
        if (!filters.yearId) return [];
        const { data, error } = await supabase.from('activities').select('id, name').eq('school_year_id', filters.yearId).order('date', { ascending: false });
        if (error) throw error;
        return data;
    }, [filters.yearId]);
    
    const { data: reportData, loading } = useSupabaseData(async () => {
        if (!filters.activityId && profile.role !== UserRole.TEACHER) return [];
        
        let query = supabase.from('participations').select('*, teachers!inner(full_name, departments(name)), activities!inner(name, date)');
        
        if (filters.activityId) {
            query = query.eq('activity_id', filters.activityId);
        }
        
        if (profile.role === UserRole.DEPT_HEAD) {
            query = query.eq('teachers.department_id', profile.department_id!);
        }

        if (profile.role === UserRole.TEACHER) {
            query = query.eq('teachers.profile_id', profile.id);
            if (filters.yearId) {
              query = query.eq('activities.school_year_id', filters.yearId);
            }
        }
        
        const { data, error } = await query.order('date', { foreignTable: 'activities', ascending: false });
        if (error) throw error;
        return data as Participation[];
    }, [filters.yearId, filters.activityId, profile.id, profile.role, profile.department_id]);

    const chartData = useMemo(() => {
        if (!reportData) return [];
        const counts = reportData.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {} as Record<ParticipationStatus, number>);

        return Object.entries(counts).map(([name, value]) => ({
            name: PARTICIPATION_STATUSES[name as ParticipationStatus].label,
            value: value,
            fill: `var(--color-${name})` // Custom colors would need to be defined
        }));
    }, [reportData]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        if (name === 'yearId') {
            setFilters(prev => ({ ...prev, activityId: '' }));
        }
    };

    return (
        <Card>
            <CardHeader title="Báo cáo Tham gia Hoạt động" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Select label="Năm học" name="yearId" value={filters.yearId} onChange={handleFilterChange}>
                    <option value="">-- Chọn Năm học --</option>
                    {schoolYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </Select>
                {profile.role !== UserRole.TEACHER && (
                    <Select label="Hoạt động" name="activityId" value={filters.activityId} onChange={handleFilterChange} disabled={!filters.yearId}>
                        <option value="">-- Chọn Hoạt động --</option>
                        {activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </Select>
                )}
            </div>

            {loading && <Spinner />}
            {!loading && reportData.length === 0 && <p>Không có dữ liệu báo cáo.</p>}
            
            {reportData.length > 0 && filters.activityId && profile.role !== UserRole.TEACHER && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700">Thống kê hoạt động</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8" name="Số lượng" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
            
            {reportData.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                {profile.role !== UserRole.TEACHER && <th className="py-3 px-6 text-left">Giáo viên</th>}
                                {profile.role === UserRole.ADMIN && <th className="py-3 px-6 text-left">Tổ</th>}
                                <th className="py-3 px-6 text-left">Hoạt động</th>
                                <th className="py-3 px-6 text-left">Ngày</th>
                                <th className="py-3 px-6 text-left">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {reportData.map((item, index) => (
                                <tr key={item.id || index}>
                                    {profile.role !== UserRole.TEACHER && <td className="py-4 px-6">{item.teachers?.full_name}</td>}
                                    {profile.role === UserRole.ADMIN && <td className="py-4 px-6">{item.teachers?.departments?.name}</td>}
                                    <td className="py-4 px-6">{item.activities?.name}</td>
                                    <td className="py-4 px-6">{new Date(item.activities!.date).toLocaleDateString()}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${PARTICIPATION_STATUSES[item.status].bgColor} ${PARTICIPATION_STATUSES[item.status].color}`}>
                                            {PARTICIPATION_STATUSES[item.status].label}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};


// --- ROLE-BASED DASHBOARD COMPONENTS ---

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('departments');
    const tabs = {
        departments: { label: 'Tổ/Phòng ban', icon: <BuildingOfficeIcon />, component: <DepartmentManager /> },
        teachers: { label: 'Giáo viên', icon: <UsersIcon />, component: <TeacherManager /> },
        schoolYears: { label: 'Năm học', icon: <CalendarIcon />, component: <SchoolYearManager /> },
        activities: { label: 'Hoạt động', icon: <ClipboardListIcon />, component: <ActivityManager /> },
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {Object.entries(tabs).map(([key, { label, icon }]) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === key ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            {icon} {label}
                        </button>
                    ))}
                </nav>
            </div>
            <div>{tabs[activeTab as keyof typeof tabs].component}</div>
        </div>
    );
};

const DeptHeadDashboard: React.FC<{ profile: Profile }> = ({ profile }) => {
    const [activeTab, setActiveTab] = useState('participation');
    return (
      <div className="space-y-6">
          <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-6">
                  <button onClick={() => setActiveTab('participation')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'participation' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                      <ClipboardListIcon /> Cập nhật Tham gia
                  </button>
                  <button onClick={() => setActiveTab('reports')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'reports' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                      <ChartBarIcon /> Xem Báo cáo
                  </button>
              </nav>
          </div>
          {activeTab === 'participation' && <ParticipationManager profile={profile} />}
          {activeTab === 'reports' && <ReportViewer profile={profile} />}
      </div>
    );
};

const TeacherDashboard: React.FC<{ profile: Profile }> = ({ profile }) => {
    return <ReportViewer profile={profile} />;
};


// --- MAIN DASHBOARD EXPORT ---

const Dashboard: React.FC = () => {
  const { profile, logout } = useAuth();

  if (!profile) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  const roleDisplay: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Admin',
      [UserRole.DEPT_HEAD]: 'Quản lý Tổ',
      [UserRole.TEACHER]: 'Giáo viên',
  };

  const renderContent = () => {
    switch (profile.role) {
      case UserRole.ADMIN:
        // Admin gets two tabs: one for management, one for reporting/participation
        return <AdminDashboardWrapper profile={profile} />;
      case UserRole.DEPT_HEAD:
        return <DeptHeadDashboard profile={profile} />;
      case UserRole.TEACHER:
        return <TeacherDashboard profile={profile} />;
      default:
        return <p>Invalid user role.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-slate-800">Teacher Activity Manager</h1>
                    <p className="text-sm text-slate-500">{profile.full_name} ({roleDisplay[profile.role]})</p>
                </div>
                <Button variant="secondary" onClick={logout}>
                    <LogoutIcon /> Đăng xuất
                </Button>
            </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};


const AdminDashboardWrapper: React.FC<{profile: Profile}> = ({profile}) => {
    const [mainTab, setMainTab] = useState('manage');
    return (
        <div className="space-y-6">
          <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-8">
                  <button onClick={() => setMainTab('manage')} className={`py-4 px-1 border-b-2 font-medium text-lg flex items-center gap-2 ${mainTab === 'manage' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                      Quản lý
                  </button>
                  <button onClick={() => setMainTab('participate')} className={`py-4 px-1 border-b-2 font-medium text-lg flex items-center gap-2 ${mainTab === 'participate' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                      Cập nhật tham gia
                  </button>
                  <button onClick={() => setMainTab('report')} className={`py-4 px-1 border-b-2 font-medium text-lg flex items-center gap-2 ${mainTab === 'report' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                      Báo cáo
                  </button>
              </nav>
          </div>
          {mainTab === 'manage' && <AdminDashboard />}
          {mainTab === 'participate' && <ParticipationManager profile={profile} />}
          {mainTab === 'report' && <ReportViewer profile={profile} />}
        </div>
    )
}

export default Dashboard;
