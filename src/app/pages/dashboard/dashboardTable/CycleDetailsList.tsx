import {Button, Input, Space, Table} from 'antd'
import {useEffect, useState} from 'react'
import axios from 'axios'
import {KTCard, KTCardBody, KTSVG} from '../../../../_metronic/helpers'
import {ENP_URL} from '../../../urls'
import {useQuery, useQueryClient} from 'react-query'

const DashboardTable = () => {
  const [gridData, setGridData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  let [filteredData] = useState([])


  const {data: listOfequipment} = useQuery('listOfEquipment', () =>
    axios.get(`${ENP_URL}/equipments`)
  )

  const {data: listOfequipmentModel} = useQuery('listOfEquipmentModel', () =>
    axios.get(`${ENP_URL}/models`)
  )

  const {data: listOfequipmentManufacturer} = useQuery('listOfEquipmentManufacturer', () =>
    axios.get(`${ENP_URL}/manufacturers`)
  )

  const {data: listOfFaults} = useQuery('listOfFaults', () =>
    axios.get(`${ENP_URL}/faultentriesapi`)
  )

  const columns: any = [
    // {
    //   title: 'ID',
    //   dataIndex: 'key',
    //   sorter: (a: any, b: any) => a.key - b.key,
    // },
    {
      title: 'Equipment Manufacturer',
      render: (apiData: any) => {
        return getEquipmentManufacturer(apiData.manufacturerId)
      },
      sorter: (a: any, b: any) => {
        if (a.name > b.name) {
          return 1
        }
        if (b.name > a.name) {
          return -1
        }
        return 0
      },
    },
    {
      title: 'Model',
      dataIndex: 'name',
      sorter: (a: any, b: any) => {
        if (a.name > b.name) {
          return 1
        }
        if (a.name < b.name) {
          return -1
        }
        return 0
      },
    },
    {
      title: 'Number of Equipment',
      sorter: (a: any, b: any) => a.modelId - b.modelId,
      render: (apiData: any) => {
        return countNumberOfEquipment(apiData.modelId)
      },
    },
    {
      title: 'Number of Down Time (Last 30 Days)',
      sorter: (a: any, b: any) => a.modelId - b.modelId,
      render: (apiData: any) => {
        return countNumberOfDownTime(apiData.modelId)
      },
    },
    {
      title: 'Number of Hours',
      //default data 0
      sorter: (a: any, b: any) => a.numOfHrs - b.numOfHrs,
      render: (apiData: any) => {
        return 0
      }
    },
  ]
  const queryClient = useQueryClient()

  const getEquipmentManufacturer = (manufacturerId: any) => {
   const manufacturer = listOfequipmentManufacturer?.data?.find((manufacturer: any) => manufacturer.manufacturerId === manufacturerId)
    return manufacturer?.name
  }
  const countNumberOfEquipment = (modelId: any) => {
    //count number of equipment
    let count = 0
    listOfequipment?.data.forEach((equipment: any) => {
      if (equipment.modelId === modelId) {
        count++
      }
    })
    return count
  }
  const countNumberOfDownTime = (modelId: any) => {
    //count number of down time from fault entries for this particular equipment
    //@ts-ignore
    const modelName = queryClient.getQueryData('listOfEquipmentModel')?.data?.find((model: any) => model.modelId == modelId).name
    console.log("modelName", modelName)

    let numberOfDowntime = 0
    const faults = listOfFaults?.data?.forEach((fault: any) => {
      console.log("fault.vmModel", fault.vmModel)
      console.log('modelName', modelName)

      // Triming these two fucking strings because they made me debug for 2hours without identifying what the hell
      // was wrong with my code. I really know how those trailing space got stored in the databases like that. What a mess!
      // Finally!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      if (fault.vmModel.trimEnd() === modelName.trimEnd()) {
        console.log('fault model ', fault.vmModel)
        numberOfDowntime++
      }
    })
    return numberOfDowntime
  }

  // @ts-ignore
  const dataWithVehicleNum = gridData.map((item: any, index) => ({
    ...item,
    // downTime: `${Math.floor(Math.random() * 100) + 1}`,
    // numOfHrs: Math.floor(Math.random() * 20) + 1,
    downTime: 0,
    numOfHrs: 0,
    key: index,
  }))

  const handleInputChange = (e: any) => {
    setSearchText(e.target.value)
    if (e.target.value === '') {
    }
  }

  const globalSearch = () => {
    // @ts-ignore
    filteredData = dataWithVehicleNum.filter((value) => {
      return (
        value.txmodel.toLowerCase().includes(searchText.toLowerCase()) ||
        value.txmanf.toLowerCase().includes(searchText.toLowerCase())
      )
    })
    setGridData(filteredData)
  }

  return (
    <KTCard>
      <KTCardBody>
        <div className='d-flex justify-content-between'>
          <Space style={{marginBottom: 16}}>
            <Input
              placeholder='Enter Search Text'
              onChange={handleInputChange}
              type='text'
              allowClear
              value={searchText}
            />
            <Button type='primary' onClick={globalSearch}>
              Search
            </Button>
          </Space>
          <Space style={{marginBottom: 16}}>
            <button type='button' className='btn btn-light-primary me-3'>
              <KTSVG path='/media/icons/duotune/arrows/arr078.svg' className='svg-icon-2' />
              Upload
            </button>
            <button type='button' className='btn btn-light-primary me-3'>
              <KTSVG path='/media/icons/duotune/arrows/arr078.svg' className='svg-icon-2' />
              Export
            </button>
          </Space>
        </div>
        <Table columns={columns} dataSource={listOfequipmentModel?.data} bordered loading={loading} />
      </KTCardBody>
    </KTCard>
  )
}

export {DashboardTable}
