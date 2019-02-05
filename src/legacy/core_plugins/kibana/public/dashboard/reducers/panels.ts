/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import _ from 'lodash3';
import { Reducer } from 'redux';
import { PanelActions, PanelActionTypeKeys, SetPanelTitleActionPayload } from '../actions';
import { PanelId, PanelsMap, PanelState } from '../selectors';

const deletePanel = (panels: PanelsMap, panelId: PanelId): PanelsMap => {
  const panelsCopy = { ...panels };
  delete panelsCopy[panelId];
  return panelsCopy;
};

const updatePanel = (panels: PanelsMap, panelState: PanelState): PanelsMap => ({
  ...panels,
  [panelState.panelIndex]: panelState,
});

const updatePanels = (panels: PanelsMap, updatedPanels: PanelsMap): PanelsMap => {
  const panelsCopy = { ...panels };
  Object.values(updatedPanels).forEach(panel => {
    panelsCopy[panel.panelIndex] = panel;
  });
  return panelsCopy;
};

const resetPanelTitle = (panels: PanelsMap, panelId: PanelId) => ({
  ...panels,
  [panelId]: {
    ...panels[panelId],
    title: undefined,
  },
});

const setPanelTitle = (panels: PanelsMap, payload: SetPanelTitleActionPayload) => ({
  ...panels,
  [payload.panelId]: {
    ...panels[payload.panelId],
    title: payload.title,
  },
});

const setPanels = (panels: PanelsMap, newPanels: PanelsMap) => _.cloneDeep(newPanels);

export const panelsReducer: Reducer<PanelsMap> = (panels = {}, action): PanelsMap => {
  switch ((action as PanelActions).type) {
    case PanelActionTypeKeys.DELETE_PANEL:
      return deletePanel(panels, action.payload);
    case PanelActionTypeKeys.UPDATE_PANEL:
      return updatePanel(panels, action.payload);
    case PanelActionTypeKeys.UPDATE_PANELS:
      return updatePanels(panels, action.payload);
    case PanelActionTypeKeys.RESET_PANEl_TITLE:
      return resetPanelTitle(panels, action.payload);
    case PanelActionTypeKeys.SET_PANEl_TITLE:
      return setPanelTitle(panels, action.payload);
    case PanelActionTypeKeys.SET_PANELS:
      return setPanels(panels, action.payload);
    default:
      return panels;
  }
};
