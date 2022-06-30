import React, {useEffect, useState} from 'react';
import {buildCategories} from "../../utils";
import './CategorySelector.scss';
import {Image, Icon, List, Transition} from "semantic-ui-react";

const CategorySelector = (props) => {
    const {onChosenCategory, selectedCategories} = props;
    const [subcategories, setSubcategories] = useState([]);
    const [chosenCategories, setToChosenCategories] = useState(selectedCategories || []);
    const categories = buildCategories();

    useEffect(() => {
        if(selectedCategories) {
            const parentCategoryId = selectedCategories[0];
            const parentCategory = categories.find(x => x.id === parentCategoryId);
            if(parentCategory) {
                let tmpSubCategories = parentCategory.subcategories;

                if(tmpSubCategories) {
                    setSubcategories(tmpSubCategories);
                }
            }
        }
    }, [])

    const handleChoose = (id, subcategories) => {
        const chosenCategoriesState = !!subcategories ? [
            ...(chosenCategories.length > 0 ? [] : chosenCategories),
            id
        ] : [
            ...chosenCategories.slice(0, 1),
            id
        ]

        setToChosenCategories(chosenCategoriesState);

        if(!!subcategories) {
            setSubcategories(subcategories);
        } else {
            onChosenCategory(chosenCategoriesState);
        }
    }

    const getCategoryDataById = id => {
        return categories.filter(x => x.id === id)[0];
    }

    const resetCategories = () => {
        setToChosenCategories([]);
        setSubcategories([])
    }

    const renderList = (categories) => {
        return (
            <List
                selection
                size="large"
                divided
                verticalAlign="middle"
            >
                {
                    categories.map(category => {
                        const {label, id, icon, subcategories} = category;
                        const isSelected = chosenCategories.indexOf(id) > -1;
                        return (
                            <List.Item key={`category-${id}`} onClick={() => handleChoose(id, subcategories)}
                                       active={isSelected}>
                                {
                                    !subcategories && isSelected ? (
                                        <Icon name="check circle" color="green"/>
                                    ) : <></>
                                }
                                {
                                    !!icon ? (
                                        <Image size="mini" src={`${process.env.PUBLIC_URL}/categories/${icon}.svg`}/>
                                    ) : <></>
                                }
                                <List.Content>
                                    {label}
                                </List.Content>
                                {
                                    !!subcategories ? (
                                        <List.Content floated="right" className="subcategories-chevron">
                                            <Icon name="chevron right" size="tiny"/>
                                        </List.Content>
                                    ) : <></>
                                }
                            </List.Item>
                        )
                    })
                }
            </List>
        )
    }

    const renderCategoryHeader = () => {
        const categoryData = getCategoryDataById(chosenCategories[0]);

        if (!!categoryData) {
            const {icon, label} = categoryData;
            return (
                <>
                    <Icon name="chevron left" /> <span>{label}</span> <Image size="tiny" src={`${process.env.PUBLIC_URL}/categories/${icon}.svg`}/>
                </>
            )
        }

        return <></>
    }

    return (
        <Transition.Group
            as={List}
            duration={150}
            animation="fade left"
            className="categories-lists-wrapper"
        >
            <List.Item className="categories-list">
                <List.Content>
                    {renderList(categories)}
                </List.Content>
            </List.Item>
            {
                subcategories.length > 0 ? (
                    <List.Item className="categories-list sub-categories-list">
                        <List.Header className="category-header" onClick={resetCategories}>
                            {renderCategoryHeader()}
                        </List.Header>
                        <List.Content>
                            {renderList(subcategories)}
                        </List.Content>
                    </List.Item>
                ) : null
            }
        </Transition.Group>
    );
};

export default CategorySelector;