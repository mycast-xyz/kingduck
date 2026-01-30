<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';

	const { listData, currentUrl, isMobile, initData } = $props<{
		listData: any; // Character level/skill data needed for calculation
		currentUrl: string;
		isMobile: boolean;
		initData: any;
	}>();

    // Placeholder logic for now
    let characterName = listData?.name || 'Character';

</script>

<Layer title={initData?.name || '재화 계산기'}>
    <div class="p-6 text-center">
        <div class="mb-4 inline-block rounded-full bg-indigo-100 p-4 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">재화 계산기</h3>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {characterName}의 육성에 필요한 재화를 계산하는 기능입니다.<br/>
            (현재 준비중입니다)
        </p>
        <button class="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50" disabled>
            계산기 열기
        </button>
    </div>
</Layer>
