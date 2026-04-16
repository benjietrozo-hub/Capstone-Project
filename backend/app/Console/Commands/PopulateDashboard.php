<?php

namespace App\Console\Commands;

use App\Models\ToolEquipment;
use App\Models\Teacher;
use App\Models\BorrowRequest;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PopulateDashboard extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:populate-dashboard';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate dashboard with sample data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Populating Dashboard with Sample Data ===');

        try {
            // Clear existing data
            DB::table('borrow_requests')->delete();
            DB::table('tools_equipment')->delete();
            DB::table('teachers')->delete();
            $this->info('Cleared existing data');

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
                    'department' => 'Math',
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
                    'department' => 'Physics',
                    'phone' => '123-456-7892',
                    'status' => 'active',
                    'password' => Hash::make('password'),
                ],
            ];

            foreach ($teachers as $teacher) {
                Teacher::create($teacher);
            }
            $this->info('Created ' . count($teachers) . ' teachers');

            // Create sample equipment
            $equipment = [
                [
                    'item_code' => 'LAB001',
                    'item_name' => 'Microscope',
                    'description' => 'Compound microscope',
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
                    'item_code' => 'COMP001',
                    'item_name' => 'Laptop',
                    'description' => 'Dell laptop',
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
                    'item_code' => 'PHY001',
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
                [
                    'item_code' => 'AV001',
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
            ];

            foreach ($equipment as $item) {
                ToolEquipment::create($item);
            }
            $this->info('Created ' . count($equipment) . ' equipment items');

            // Create sample borrow requests
            $teacherIds = Teacher::pluck('id')->toArray();
            $equipmentIds = ToolEquipment::pluck('id')->toArray();

            $borrowRequests = [
                [
                    'teacher_id' => $teacherIds[0],
                    'item_id' => $equipmentIds[0],
                    'quantity_requested' => 1,
                    'purpose' => 'Biology experiment',
                    'borrow_date' => now()->subDays(5),
                    'expected_return_date' => now()->addDays(7),
                    'status' => 'approved',
                    'condition_before' => 'good',
                ],
                [
                    'teacher_id' => $teacherIds[1],
                    'item_id' => $equipmentIds[1],
                    'quantity_requested' => 2,
                    'purpose' => 'Computer lab session',
                    'borrow_date' => now()->subDays(3),
                    'expected_return_date' => now()->addDays(5),
                    'status' => 'borrowed',
                    'condition_before' => 'good',
                ],
                [
                    'teacher_id' => $teacherIds[2],
                    'item_id' => $equipmentIds[2],
                    'quantity_requested' => 1,
                    'purpose' => 'Math exam prep',
                    'borrow_date' => now()->subDays(10),
                    'expected_return_date' => now()->subDays(2), // Overdue
                    'status' => 'borrowed',
                    'condition_before' => 'fair',
                ],
                [
                    'teacher_id' => $teacherIds[0],
                    'item_id' => $equipmentIds[1],
                    'quantity_requested' => 1,
                    'purpose' => 'Classroom presentation',
                    'borrow_date' => now()->subDays(1),
                    'expected_return_date' => now()->addDays(3),
                    'status' => 'pending',
                    'condition_before' => 'good',
                ],
            ];

            foreach ($borrowRequests as $request) {
                BorrowRequest::create($request);
            }
            $this->info('Created ' . count($borrowRequests) . ' borrow requests');

            // Display dashboard data
            $totalItems = ToolEquipment::count();
            $availableItems = ToolEquipment::sum('quantity_available');
            $borrowedItems = ToolEquipment::sum('quantity_borrowed');
            $totalTeachers = Teacher::active()->count();
            $pendingRequests = BorrowRequest::pending()->count();
            $overdueItems = BorrowRequest::overdue()->count();

            $this->info(PHP_EOL . '=== Dashboard Data ===');
            $this->info('Total Items: ' . $totalItems);
            $this->info('Available Items: ' . $availableItems);
            $this->info('Borrowed Items: ' . $borrowedItems);
            $this->info('Total Teachers: ' . $totalTeachers);
            $this->info('Pending Requests: ' . $pendingRequests);
            $this->info('Overdue Items: ' . $overdueItems);

            $this->info(PHP_EOL . 'Dashboard populated successfully!');

        } catch (Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            $this->error('File: ' . $e->getFile());
            $this->error('Line: ' . $e->getLine());
        }
    }
}
