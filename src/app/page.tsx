import StackedBarChart from "@/components/AgeAndGenderChajrt"
import GroupedBarChart from "@/components/AnswerChajrt"
import LocationChart from "@/components/LocationChart"

const Home = () => {
return (
  <div>
   <StackedBarChart/>
   <LocationChart/>
   <GroupedBarChart/>
  </div>
)
}

export default Home