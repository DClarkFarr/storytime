import { Ref, computed, ref, toRef } from "vue";

export type UsePaginateItems = {
    perPage: Ref<number> | number;
    page: Ref<number> | number;
    items: Ref<number> | number;
};

const usePaginate = <T>(props: UsePaginateItems) => {
    const page = computed(() =>
        typeof props.page === "number" ? props.page : props.page.value
    );
    const items = computed(() => {
        return typeof props.items === "number"
            ? props.items
            : props.items.value;
    });

    const perPage = computed(() => {
        return typeof props.perPage === "number"
            ? props.perPage
            : props.perPage.value;
    });

    const offset = computed(() => {
        return (page.value - 1) * perPage.value;
    });
    const pages = computed(() => {
        if (!items.value || !perPage.value) {
            return 1;
        }
        return Math.max(1, Math.ceil(items.value / perPage.value));
    });

    const visibleItemIndexes = computed(() => {
        const indexes: number[] = [offset.value];

        for (let i = 1; i < perPage.value; i++) {
            if (offset.value + i < items.value) {
                indexes.push(offset.value + i);
            }
        }

        return indexes;
    });

    return {
        offset,
        pages,
        visibleItemIndexes,
    };
};

export default usePaginate;
