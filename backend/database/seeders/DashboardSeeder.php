<?php

namespace Database\Seeders;

use App\Models\ToolEquipment;
use App\Models\Teacher;
use App\Models\BorrowRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DashboardSeeder extends Seeder
{
    /**
     * Seed the dashboard with sample data.
     */
    public function run(): void
    {
        // Clear existing data to start fresh
        DB::table('borrow_requests')->delete();
        DB::table('tools_equipment')->delete();
        DB::table('teachers')->delete();

        // Create sample teachers
        $teachers = [
            [
                'teacher_id' => 'T001',
                'employee_id' => 'EMP001',
                'username' => 'john.doe',
                'email' => 'john.doe@school.edu',
                'first_name' => 'John',
                'last_name' => 'Doe',
                'department' => 'Science',
                'phone' => '123-456-7890',
                'status' => 'active',
                'password' => Hash::make('password'),
            ],
            [
                'teacher_id' => 'T002',
                'employee_id' => 'EMP002',
                'username' => 'jane.smith',
                'email' => 'jane.smith@school.edu',
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'department' => 'Mathematics',
                'phone' => '123-456-7891',
                'status' => 'active',
                'password' => Hash::make('password'),
            ],
            [
                'teacher_id' => 'T003',
                'employee_id' => 'EMP003',
                'username' => 'mike.johnson',
                'email' => 'mike.johnson@school.edu',
                'first_name' => 'Mike',
                'last_name' => 'Johnson',
                'department' => 'Computer Lab',
                'phone' => '123-456-7892',
                'status' => 'active',
                'password' => Hash::make('password'),
            ],
            [
                'teacher_id' => 'T004',
                'employee_id' => 'EMP004',
                'username' => 'sarah.wilson',
                'email' => 'sarah.wilson@school.edu',
                'first_name' => 'Sarah',
                'last_name' => 'Wilson',
                'department' => 'Physics',
                'phone' => '123-456-7893',
                'status' => 'active',
                'password' => Hash::make('password'),
            ],
            [
                'teacher_id' => 'T005',
                'employee_id' => 'EMP005',
                'username' => 'david.brown',
                'email' => 'david.brown@school.edu',
                'first_name' => 'David',
                'last_name' => 'Brown',
                'department' => 'Chemistry',
                'phone' => '123-456-7894',
                'status' => 'inactive', // One inactive teacher
                'password' => Hash::make('password'),
            ],
        ];

        foreach ($teachers as $teacher) {
            Teacher::create($teacher);
        }

        // Create sample equipment
        $equipment = [
            [
                'item_code' => 'LAB001',
                'item_name' => 'Microscope',
                'description' => 'Compound microscope for biology',
                'category' => 'Lab',
                'quantity_total' => 10,
                'quantity_available' => 7,
                'quantity_borrowed' => 3,
                'condition_status' => 'good',
                'location' => 'Science Lab',
                'unit_price' => 299.99,
                'acquisition_date' => now()->subMonths(6),
                'status' => 'active',
            ],
            [
                'item_code' => 'LAB002',
                'item_name' => 'Centrifuge',
                'description' => 'Laboratory centrifuge',
                'category' => 'Lab',
                'quantity_total' => 5,
                'quantity_available' => 4,
                'quantity_borrowed' => 1,
                'condition_status' => 'excellent',
                'location' => 'Science Lab',
                'unit_price' => 899.99,
                'acquisition_date' => now()->subMonths(12),
                'status' => 'active',
            ],
            [
                'item_code' => 'COMP001',
                'item_name' => 'Laptop',
                'description' => 'Dell laptop for students',
                'category' => 'PC',
                'quantity_total' => 25,
                'quantity_available' => 20,
                'quantity_borrowed' => 5,
                'condition_status' => 'good',
                'location' => 'Computer Lab',
                'unit_price' => 599.99,
                'acquisition_date' => now()->subMonths(3),
                'status' => 'active',
            ],
            [
                'item_code' => 'COMP002',
                'item_name' => 'Projector',
                'description' => 'Epson projector',
                'category' => 'AV',
                'quantity_total' => 8,
                'quantity_available' => 6,
                'quantity_borrowed' => 2,
                'condition_status' => 'good',
                'location' => 'AV Room',
                'unit_price' => 449.99,
                'acquisition_date' => now()->subMonths(8),
                'status' => 'active',
            ],
            [
                'item_code' => 'MATH001',
                'item_name' => 'Calculator',
                'description' => 'Scientific calculator',
                'category' => 'Math',
                'quantity_total' => 30,
                'quantity_available' => 28,
                'quantity_borrowed' => 2,
                'condition_status' => 'fair',
                'location' => 'Math Dept',
                'unit_price' => 89.99,
                'acquisition_date' => now()->subMonths(15),
                'status' => 'active',
            ],
            [
                'item_code' => 'PHYS001',
                'item_name' => 'Physics Set',
                'description' => 'Physics experiment set',
                'category' => 'Phys',
                'quantity_total' => 12,
                'quantity_available' => 12,
                'quantity_borrowed' => 0,
                'condition_status' => 'excellent',
                'location' => 'Physics Lab',
                'unit_price' => 199.99,
                'acquisition_date' => now()->subMonths(4),
                'status' => 'active',
            ],
            [
                'item_code' => 'CHEM001',
                'item_name' => 'Chemistry Kit',
                'description' => 'Basic chemistry kit',
                'category' => 'Chem',
                'quantity_total' => 15,
                'quantity_available' => 10,
                'quantity_borrowed' => 5,
                'condition_status' => 'good',
                'location' => 'Chem Lab',
                'unit_price' => 149.99,
                'acquisition_date' => now()->subMonths(10),
                'status' => 'active',
            ],
        ];

        foreach ($equipment as $item) {
            ToolEquipment::create($item);
        }

        // Create sample borrow requests
        $teacherIds = Teacher::pluck('id')->toArray();
        $equipmentIds = ToolEquipment::pluck('id')->toArray();

        $borrowRequests = [
            [
                'teacher_id' => $teacherIds[0], // John Doe
                'item_id' => $equipmentIds[0], // Microscope
                'quantity_requested' => 1,
                'purpose' => 'Biology experiment for class',
                'borrow_date' => now()->subDays(5),
                'expected_return_date' => now()->addDays(7),
                'status' => 'approved',
                'condition_before' => 'good',
            ],
            [
                'teacher_id' => $teacherIds[1], // Jane Smith
                'item_id' => $equipmentIds[2], // Laptop
                'quantity_requested' => 2,
                'purpose' => 'Computer lab session',
                'borrow_date' => now()->subDays(3),
                'expected_return_date' => now()->addDays(5),
                'status' => 'borrowed',
                'condition_before' => 'good',
            ],
            [
                'teacher_id' => $teacherIds[2], // Mike Johnson
                'item_id' => $equipmentIds[1], // Centrifuge
                'quantity_requested' => 1,
                'purpose' => 'Research project',
                'borrow_date' => now()->subDays(10),
                'expected_return_date' => now()->subDays(2), // Overdue!
                'status' => 'borrowed',
                'condition_before' => 'excellent',
            ],
            [
                'teacher_id' => $teacherIds[3], // Sarah Wilson
                'item_id' => $equipmentIds[3], // Projector
                'quantity_requested' => 1,
                'purpose' => 'Classroom presentation',
                'borrow_date' => now()->subDays(1),
                'expected_return_date' => now()->addDays(3),
                'status' => 'pending',
                'condition_before' => 'good',
            ],
            [
                'teacher_id' => $teacherIds[0], // John Doe again
                'item_id' => $equipmentIds[4], // Calculator
                'quantity_requested' => 5,
                'purpose' => 'Math exam preparation',
                'borrow_date' => now()->subDays(7),
                'expected_return_date' => now()->subDays(1), // Overdue!
                'status' => 'borrowed',
                'condition_before' => 'fair',
            ],
            [
                'teacher_id' => $teacherIds[1], // Jane Smith again
                'item_id' => $equipmentIds[5], // Physics Set
                'quantity_requested' => 2,
                'purpose' => 'Physics demonstration',
                'borrow_date' => now()->subDays(2),
                'expected_return_date' => now()->addDays(5),
                'status' => 'pending',
                'condition_before' => 'excellent',
            ],
        ];

        foreach ($borrowRequests as $request) {
            BorrowRequest::create($request);
        }

        $this->command->info('Dashboard sample data created successfully!');
        $this->command->info('Created:');
        $this->command->info('- ' . count($teachers) . ' teachers (4 active, 1 inactive)');
        $this->command->info('- ' . count($equipment) . ' equipment items');
        $this->command->info('- ' . count($borrowRequests) . ' borrow requests (2 pending, 3 borrowed, 2 overdue)');
    }
}
