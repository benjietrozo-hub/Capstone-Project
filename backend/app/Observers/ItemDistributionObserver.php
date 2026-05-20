<?php

namespace App\Observers;

use App\Models\ItemDistribution;

class ItemDistributionObserver
{
    /**
     * Handle the ItemDistribution "created" event.
     */
    public function created(ItemDistribution $itemDistribution): void
    {
        //
    }

    /**
     * Handle the ItemDistribution "updated" event.
     */
    public function updated(ItemDistribution $itemDistribution): void
    {
        //
    }

    /**
     * Handle the ItemDistribution "deleted" event.
     */
    public function deleted(ItemDistribution $itemDistribution): void
    {
        //
    }

    /**
     * Handle the ItemDistribution "restored" event.
     */
    public function restored(ItemDistribution $itemDistribution): void
    {
        //
    }

    /**
     * Handle the ItemDistribution "force deleted" event.
     */
    public function forceDeleted(ItemDistribution $itemDistribution): void
    {
        //
    }
}
