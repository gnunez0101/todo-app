import { useEffect, useReducer, useRef, useState } from 'react';
import darkIcon  from './assets/images/icon-sun.svg';
import lightIcon from './assets/images/icon-moon.svg'
import crossIcon from './assets/images/icon-cross.svg';
import checkIcon from './assets/images/icon-check.svg';
import './DragDropTouch.js';    // External Polyfill for drag&drop for mobile browsers

function App() {
  const [count, setCount] = useState(0);
  const [modeIcon, setModeIcon] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [overItem, setOverItem] = useState(-1);

  const dragItem      = useRef<any>(null);
  const dragOverItem  = useRef<any>(null);
  const inputRef      = useRef<any>(null);
  const menuSelect    = useRef<number>(0);

  const mobileSize   = 375;

  type typeAction =  
    | { type: 'add',    description: string }
    | { type: 'change', index: number, status: boolean }
    | { type: 'move',   from: number, to: number, e: React.DragEvent<HTMLDivElement> }
    | { type: 'remove', index: number }
    | { type: 'clearC' }
    | { type: 'All' }
    | { type: 'Active' }
    | { type: 'Completed' }

  type typeItem = {
    show: boolean,
    completed: boolean,
    description: string
  }

  type typeList = typeItem[];

  const items_list = [
    { show:true, completed: false, description: "Complete online Javascript course" },
    { show:true, completed: false, description: "Jog around the park 3x" },
    { show:true, completed: true,  description: "10 minutes meditation" },
    { show:true, completed: false, description: "Read for 1 hour" },
    { show:true, completed: true,  description: "Pick up groceries" },
    { show:true, completed: false, description: "Complete Todo App for Frontend Mentor" }
  ]

  const listReducer = (state: typeList, action: typeAction): typeList => {
    switch ( action.type ) {

      case 'add': {
        return [ ...state, { show: true, completed: false, description: action.description } ]
      }

      case 'change': {
        return state.map( (item: typeItem, index: number) => {
          return {
            show: true, 
            completed: index == action.index ? !item.completed : item.completed, 
            description: item.description
          }
        })
      }

      case 'move': {
        let _state = [...state];   // Copy of original state
        let dragItemContent = _state.splice(action.from, 1)[0];
        _state.splice(action.to, 0, dragItemContent);
        return _state;
      }

      case 'remove': {
        return state.filter((item: typeItem, index: number) => index != action.index)
      }

      case 'clearC': {
        return state.filter((item: typeItem) => !item.completed)
      }

      case 'All': {
        menuSelect.current = 0;
        return state.map( (item: typeItem) => {
          return {
            show: true, 
            completed: item.completed, 
            description: item.description
          }
        })
      }

      case 'Active': {
        menuSelect.current = 1;
        return state.map( (item: typeItem) => {
          return {
            show: !item.completed, 
            completed: item.completed, 
            description: item.description
          }
        })
      }

      case 'Completed': {
        menuSelect.current = 2;
        return state.map( (item: typeItem) => {
          return {
            show: item.completed, 
            completed: item.completed, 
            description: item.description
          }
        })
      }

      default: 
        return state;

    }
  }

  const [itemsToDo, dispatch] = useReducer(listReducer, items_list);

  // const [windowSize, setWindowSize] = useState(0);
  const windowSize = useRef(0);

  useEffect(() => {
    const handleResize = () => { windowSize.current = window.innerWidth }
    windowSize.current = window.innerWidth;
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (darkMode) setModeIcon(darkIcon);
    else setModeIcon(lightIcon);
  }, [darkMode]);

  useEffect(() => {
    if(itemsToDo) {
      setCount(itemsToDo.length);
    }
  }, [itemsToDo]);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  }

  const initSortableList = (e: React.DragEvent<HTMLDivElement>) => {
    dispatch({type: 'move', from: dragItem.current, to: dragOverItem.current, e});
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    initSortableList(e);
    dragItem.current = null;
    dragOverItem.current = null;
  }

  function TodoItem( {toDo, index} : {toDo: typeItem, index: number} ) {
    return(
      toDo.show &&
      <div draggable className = "todo-item"
        onDragStart={() => handleDragStart(index)}
        onDrag={(e) => e.preventDefault()}
        onDragEnter={() => dragOverItem.current = index}
        onDragOver={(e) => e.preventDefault()}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setOverItem(index)}
        onMouseLeave={() => setOverItem(-1)}
        >
        <div className={`check${toDo.completed ? " checked" : ""}`}
          onClick={() => dispatch( {type: 'change', index, status: !toDo.completed} ) }
          >
          {toDo.completed ? <img src={checkIcon} alt="icon" /> : <></>}
        </div>
        <div className={`text${toDo.completed ? " checked" : ""}` }>
          {toDo.description}
        </div>
        <div className="cross" 
          onClick={() => dispatch({type: 'remove', index})}
          >
          <img src={crossIcon} alt="remove" hidden={windowSize.current > mobileSize && overItem != index } />
        </div>
      </div>
    )
  }

  function Menu() {
    return (
      <div className="menu">
        <div className={`opt-all ${menuSelect.current == 0 ? "active" : ""}`}
          onClick={() => dispatch({ type: 'All' })}>
          All
        </div>
        <div className={`opt-active ${menuSelect.current == 1 ? "active" : ""}`}
          onClick={() => dispatch({ type: 'Active' })}>
          Active
        </div>
        <div className={`opt-completed ${menuSelect.current == 2 ? "active" : ""}`}
          onClick={() => dispatch({ type: 'Completed' })}>
          Completed
        </div>
      </div>
    )
  }

  const handleSubmit = (event: any) => {
    event.preventDefault()
    if(inputRef.current.value.length > 0) {
      dispatch({type: 'add', description: inputRef.current.value})
      inputRef.current.value = ''
    }
  }

  let theme = darkMode ? "dark-mode" : "light-mode";
  return (
    <main className={theme}>
      <header className="upper">
        <section className="container">

          <header className="header">
            <div className="title-bar">
              <div className="title">
                Todo
              </div>
              <div className="mode-toggle"
                onClick={() => {setDarkMode(!darkMode)}}>
                <img src={modeIcon} alt="mode" />
              </div>
            </div>

            <form action="" className="new-todo"
              onSubmit={handleSubmit}
              >
              <div className="todo-check">
                <button className="check"></button>
              </div>
              <input type="text" name="new-todo" id="new-todo" spellCheck={false}
                placeholder='Create a new todo...'
                ref={inputRef}
                />
            </form>

          </header>
          <article className="items">
            { itemsToDo &&
              itemsToDo.map( (item: typeItem, index: number) =>
                <TodoItem key={index} toDo={item} index={index}/>
              )
            }
          </article>
          <article className="totals">
            <div className="items-left">
              {count} Items left
            </div>
            { windowSize.current > mobileSize && <Menu /> }
            <div className="clear-completed"
              onClick={ () => dispatch( { type: 'clearC' } ) }>
              Clear Completed
            </div>
          </article>

          { windowSize.current <= mobileSize && <Menu /> }

          { count > 0 &&
            <footer className="footer">
              Drag and drop to reorder list
            </footer>
          }
        </section>
      </header>

      <div className="empty-space"></div>

      <div className="attribution">
        Challenge by <a href="https://www.frontendmentor.io?ref=challenge" target="_blank">Frontend Mentor</a>. 
        Coded by <a href="#">Gonzalo M. Núñez</a>.
      </div>
    </main>
  )
}
export default App

