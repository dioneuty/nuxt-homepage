<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 my-6">
    <h2 class="text-2xl font-bold mb-4 dark:text-white flex items-center">
      <Icon icon="mdi:calendar" class="mr-2" />
      달력
    </h2>
    <div class="mb-4">
      <button @click="addEvent" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
        이벤트 추가
      </button>
      <button @click="removeLastEvent" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        마지막 이벤트 삭제
      </button>
    </div>
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  firstDay: 1, // 월요일을 주의 시작으로 설정
  headerToolbar: {
    left: 'prev,next,today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek,dayGridDay'
  },
  titleFormat: { year: 'numeric', month: 'long' },
  buttonText: {
    today: '오늘',
    month: '월',
    week: '주',
    day: '일'
  },
  locale: 'ko',
  showNonCurrentDates: false, // 현재 달에 속하지 않는 날짜 숨기기
  fixedWeekCount: false, // 항상 6주를 표시하지 않고 실제 주 수에 맞춤
  events: [
    { title: '이벤트 1', date: '2024-09-01', },
    { title: '이벤트 2', date: '2024-09-15', },
  ],
  dateClick: (info) => {
    console.log('날짜 클릭:', info.dateStr)
  },
  eventClick: (info) => {
    console.log('이벤트 클릭:', info.event.title)
  },
  dayCellClassNames: (arg) => {
    if (arg.date.getDay() === 0) {
      return ['sunday']
    } else if (arg.date.getDay() === 6) {
      return ['saturday']
    }
    return []
  },
  datesSet: handleDatesSet
})

// 이벤트 추가 함수
function addEvent() {
  const newEvent = {
    title: '새 이벤트',
    date: new Date().toISOString().split('T')[0], // 오늘 날짜
  }
  calendarOptions.value.events.push(newEvent)
}

// 마지막 이벤트 삭제 함수
function removeLastEvent() {
  if (calendarOptions.value.events.length > 0) {
    calendarOptions.value.events.pop()
  }
}

// DB에서 공휴일 정보를 가져오는 함수
async function fetchHolidays(year, month) {
  try {
    // 실제 API 호출 (예시)
    const response = await fetch(`/api/holidays?year=${year}&month=${month}`)
    const data = await response.json()
    
    // 임시 데이터 (실제 구현 시 이 부분을 API 호출로 대체하세요)
    // const data = [
    //   { name: '설날', date: '2023-01-22' },
    //   { name: '삼일절', date: '2023-03-01' },
    //   { name: '어린이날', date: '2023-05-05' },
    //   { name: '광복절', date: '2023-08-15' },
    //   { name: '추석', date: '2023-09-29' },
    //   { name: '개천절', date: '2023-10-03' },
    //   { name: '한글날', date: '2023-10-09' },
    //   { name: '크리스마스', date: '2023-12-25' }
    // ].filter(holiday => {
    //   const [holidayYear, holidayMonth] = holiday.date.split('-')
    //   return holidayYear === year.toString() && holidayMonth === month.toString().padStart(2, '0')
    // })

    
    const holidays = data.map(holiday => ({
      title: holiday.name,
      date: `${holiday.year}-${String(holiday.month).padStart(2, '0')}-${String(holiday.day).padStart(2, '0')}`,
      classNames: ['holiday'],
      display: 'background'
    }))

    console.log('holidays', holidays)

    return holidays
  } catch (error) {
    console.error('공휴일 정보를 가져오는 데 실패했습니다:', error)
    return []
  }
}

async function handleDatesSet(dateInfo) {
  const year = dateInfo.view.currentStart.getFullYear()
  const month = dateInfo.view.currentStart.getMonth() + 1 // getMonth()는 0부터 시작하므로 1을 더합니다
  
  const fetchedHolidays = await fetchHolidays(year, month)


  // 기존 이벤트와 공휴일 정보를 합칩니다
  calendarOptions.value.events = [...calendarOptions.value.events, ...fetchedHolidays]
}

onMounted(async () => {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  const fetchedHolidays = await fetchHolidays(currentYear, currentMonth)

  // 기존 이벤트와 공휴일 정보를 합칩니다
  calendarOptions.value.events = [...calendarOptions.value.events, ...fetchedHolidays]
})

</script>

<style>
@import '@/assets/css/calendar.css';
</style>