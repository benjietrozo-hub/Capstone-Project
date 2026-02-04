import React from 'react';
import { Badge } from './Badge';

interface InventoryItem {
  id?: number;
  item_name?: string;
  name?: string;
  description?: string;
  category: string;
  condition_status?: string;
  condition?: string;
  quantity_available?: number;
  available?: number;
  quantity_borrowed?: number;
  borrowed?: number;
  quantity_total?: number;
  total?: number;
  location?: string;
  unit_price?: number;
}

interface InventoryCardProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
}

export function InventoryCard({ item, onEdit, onDelete }: InventoryCardProps) {
  const getCategoryColor = (category: string) => {
    return category === 'Tool' ? 'primary' : 'info';
  };

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      'Excellent': 'success',
      'Good': 'success',
      'Fair': 'warning',
      'Poor': 'warning',
      'Damaged': 'danger'
    };
    return colors[condition] || 'secondary';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }}
    >
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '15px'
        }}>
          <h5 style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#333',
            flex: 1,
            marginRight: '10px'
          }}>
            {item.item_name || item.name}
          </h5>
          <Badge type={getCategoryColor(item.category)}>
            {item.category}
          </Badge>
        </div>

        {/* Description */}
        {item.description && (
          <p style={{
            color: '#6c757d',
            fontSize: '0.9rem',
            marginBottom: '15px',
            lineHeight: '1.5'
          }}>
            {item.description.length > 100 
              ? item.description.substring(0, 100) + '...' 
              : item.description}
          </p>
        )}

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '15px'
        }}>
          <div>
            <small style={{ color: '#6c757d', display: 'block', marginBottom: '5px' }}>
              Condition:
            </small>
            <Badge type={getConditionColor(item.condition_status || item.condition || '')}>
              {item.condition_status || item.condition}
            </Badge>
          </div>
          <div>
            <small style={{ color: '#6c757d', display: 'block', marginBottom: '5px' }}>
              Available:
            </small>
            <strong style={{
              color: (item.quantity_available || item.available || 0) > 0 ? '#51cf66' : '#ff6b6b',
              fontSize: '1.1rem'
            }}>
              {item.quantity_available || item.available || 0}
            </strong>
          </div>
          <div>
            <small style={{ color: '#6c757d', display: 'block', marginBottom: '5px' }}>
              Borrowed:
            </small>
            <small style={{ color: '#ffd43b', fontWeight: '600' }}>
              {item.quantity_borrowed || item.borrowed || 0}
            </small>
          </div>
          <div>
            <small style={{ color: '#6c757d', display: 'block', marginBottom: '5px' }}>
              Total:
            </small>
            <small style={{ fontWeight: '600' }}>
              {item.quantity_total || item.total || 0}
            </small>
          </div>
        </div>

        {/* Location and Price */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '15px',
          paddingTop: '15px',
          borderTop: '1px solid #e9ecef'
        }}>
          <div>
            <small style={{ color: '#6c757d', display: 'block', marginBottom: '5px' }}>
              Location:
            </small>
            <small style={{ fontWeight: '500' }}>
              {item.location || 'N/A'}
            </small>
          </div>
          <div>
            <small style={{ color: '#6c757d', display: 'block', marginBottom: '5px' }}>
              Price:
            </small>
            <small style={{ fontWeight: '500' }}>
              {item.unit_price ? formatCurrency(item.unit_price) : 'N/A'}
            </small>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px',
          marginTop: 'auto'
        }}>
          <button
            onClick={() => onEdit && onEdit(item)}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: '2px solid #2d7a3e',
              background: 'white',
              color: '#2d7a3e',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2d7a3e';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#2d7a3e';
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete && onDelete(item)}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: '2px solid #ff6b6b',
              background: 'white',
              color: '#ff6b6b',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff6b6b';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#ff6b6b';
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
