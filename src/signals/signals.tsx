import { createSignal } from 'solid-js'

export const [filter1, setFilter1] = createSignal('')
export const [csvData, setCsvData] = createSignal([])
export const [currentView, setCurrentView] = createSignal('landing')
export const [filter, setFilter] = createSignal('')
export const [itemsData, setItemsData] = createSignal([])
export const [localView, setLocalView] = createSignal('cd')