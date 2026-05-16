<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;

class SystemSettingController extends Controller
{
    private function normalizeValue(string $key, mixed $value): mixed
    {
        if ($key === 'maintenance_mode') {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
        }

        return $value;
    }

    /**
     * Get a setting by key
     */
    public function getSetting($key)
    {
        $setting = SystemSetting::where('key', $key)->first();
        
        if (!$setting) {
            return response()->json([
                'success' => true,
                'data' => null
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $this->normalizeValue($key, $setting->value)
        ]);
    }

    /**
     * Update or create a setting (Admin only)
     */
    public function updateSetting(Request $request, $key)
    {
        $request->validate([
            'value' => 'required',
        ]);

        $setting = SystemSetting::updateOrCreate(
            ['key' => $key],
            ['value' => $this->normalizeValue($key, $request->value)]
        );

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'data' => $this->normalizeValue($key, $setting->value)
        ]);
    }
}
