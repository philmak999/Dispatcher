import './EditButton.scss'
import editIcon from '../../assets/icons/Edit.svg'

function EditButton({ onClick }) {
  return (
    <button className="edit-button" type="button" onClick={onClick}>
      <img className="edit-button__icon" src={editIcon} alt="" aria-hidden="true" />
      <span className="edit-button__text">Edit</span>
    </button>
  )
}

export default EditButton
