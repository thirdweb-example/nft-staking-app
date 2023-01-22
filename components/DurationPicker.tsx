import { useEffect, useState } from "react"
import { useStateUint } from "../helpers/useState"

export default function DurationPicker(options) {
  const {
    value,
    onChange
  } = options

  const [ newValue, setNewValue ] = useStateUint(value)

  const [ newInSecs, setNewInSecs ] = useStateUint(0)
  const [ newDays, setNewDays ] = useStateUint(0)
  const [ newHours, setNewHours ] = useStateUint(0)
  const [ newMins, setNewMins ] = useStateUint(0)
  const [ newSecs, setNewSecs ] = useStateUint(0)

  
  useEffect(() => {
    const inSeconds = Number(newDays) * 86400 + Number(newHours) * 3600 + Number(newMins) * 60 + Number(newSecs)
    setNewInSecs(inSeconds)
    onChange(inSeconds)
  }, [ newDays, newHours, newMins, newSecs ])
  
  useEffect(() => {
    const seconds = Number(newValue)
    const d = Math.floor(seconds / (3600*24))
    const h = Math.floor(seconds % (3600*24) / 3600)
    const m = Math.floor(seconds % 3600 / 60)
    const s = Math.floor(seconds % 60)
    setNewDays(d)
    setNewHours(h)
    setNewMins(m)
    setNewSecs(s)
    setNewInSecs(newValue)
  }, [ newValue ])

  return (
    <>
      <style jsx>
      {`
        .durationPicker {
          font-size: 10pt;
        }
        .durationPicker>DIV:first-child {
          display: flex;
        }
        .durationPicker SPAN {
          display: block;
          text-align: center;
        }
        .durationPicker INPUT {
          display: block;
          width: 64px;
          padding: 2px;
          font-size: 10pt;
          height: 28px;
        }
        .durationPicker>DIV>DIV {
          margin: 0 5px;
        }
        .durationPicker>DIV>DIV:first-child {
          margin-left: 0px;
        }
        .durationPicker>DIV>DIV:last-child {
          margin-right: 0px;
        }
      `}
      </style>
      <div className="durationPicker">
        <div>
          <div>
            <span>Days</span>
            <input type="number" min="0" value={newDays} onChange={(e) => { setNewDays(e.target.value) }} />
          </div>
          <div>
            <span>Hours</span>
            <input type="number" min="0" max="24" value={newHours} onChange={(e) => { setNewHours(e.target.value) }} />
          </div>
          <div>
            <span>Mins</span>
            <input type="number" min="0" max="59" value={newMins} onChange={(e) => { setNewMins(e.target.value) }} />
          </div>
          <div>
            <span>Secs</span>
            <input type="number" min="0" max="59" value={newSecs} onChange={(e) => { setNewSecs(e.target.value) }} />
          </div>
        </div>
        <div>
          <span>Duration in seconds: <b>{newInSecs}</b></span>
        </div>
      </div>
    </>
  )
}