import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Button, FormField } from '../../components/common/FormElements';
import { Badge } from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { teacherAPI } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';

interface InventoryItem {
  id: number;
  item_code: string;
  item_name: string;
  description?: string;
  category: string;
  quantity: number;
  condition: string;
  location?: string;
  unit_price?: number;
  acquisition_date?: string;
  notes?: string;
  status: string;
}

interface FormData {
  item_code: string;
  item_name: string;
  description: string;
  category: string;
  quantity: number;
  condition: string;
  location: string;
  unit_price: string;
  acquisition_date: string;
  notes: string;
  status: string;
}

interface FormErrors {
  [key: string]: string[];
}

export function MyInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [formData, setFormData] = use