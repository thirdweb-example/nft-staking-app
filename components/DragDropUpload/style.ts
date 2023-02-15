import styled, { css } from 'styled-components';

const primary = '#000',
  darkGray = '#000',
  lightGray = '#000';

const defaultStyle = css`
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  border: solid 2px ${primary};
  padding: 8px 16px 8px 8px;
  border-radius: 5px;
  cursor: pointer;
  flex-grow: 0;
`;
export const UploaderWrapper = styled.label<any>`
  position: relative;
  ${(props) => (props.overRide ? '' : defaultStyle)};
  &.is-disabled {
    border: dashed 2px ${darkGray};
    cursor: no-drop;
    svg {
      width: 24px;
      height: 24px;
      margin-right: 10px;
      fill: ${darkGray};
      color: ${darkGray};
      path {
        fill: ${darkGray};
        color: ${darkGray};
      }
    }
  }
  & > input {
    display: none;
  }
`;
/**
 *
 * @internal
 */
export const HoverMsg = styled.div`
  border: dashed 2px ${darkGray};
  border-radius: 5px;
  background-color: ${lightGray};
  opacity: 0.5;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  & > span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
`;
/**
 *
 * @internal
 */
export const DescriptionWrapper = styled.div<{ error: boolean }>`
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
  & > span {
    font-size: 12px;
    color: ${(props) => (props.error ? 'red' : darkGray)};
  }
  .file-types {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 100px;
  }
`;
/**
 *
 * @internal
 */
export const Description = styled.span`
  font-size: 14px;
  color: ${darkGray};
  span {
    text-decoration: underline;
  }
`;
